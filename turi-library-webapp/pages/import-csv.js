import { useState } from 'react';
import Papa from 'papaparse';
import Head from 'next/head';
import Header from '../components/Header';
import { FixedSizeList as List } from 'react-window';

export default function ImportCSV() {
  const [csvData, setCsvData] = useState([]);
  const [enrichedBooks, setEnrichedBooks] = useState([]);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [collecting, setCollecting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  // 1. Handle CSV upload and preview
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileName(file.name);
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
            // Lowercase all field names for each row
            const normalized = results.data.map(row =>
                Object.fromEntries(
                    Object.entries(row).map(([k, v]) => [k.toLowerCase(), v])
                )
            );setCsvData(normalized);
        },
        error: (err) => setError(err.message),
      });
    }
    console.log('File selected:', file);
    console.log('Parsed CSV data:', csvData);
  };

  // 2. Collect book info from Open Library
  const handleCollectInfo = async () => {
    setCollecting(true);
    setError(null);
    try {
        const enriched = await Promise.all(csvData.map(async (row) => {
            console.log('Processing row:', row);
            let bookInfo = { ...row };

            // Try to get info by ISBN first
            let isbn = row.isbn?.replace(/[^0-9Xx]/g, '');
            let apiData = null;

            if (isbn) {
                // Try direct ISBN endpoint
                console.log('Fetching book info by ISBN:', isbn);
                const resp = await fetch(`https://openlibrary.org/isbn/${isbn}.json`);
                if (resp.ok) {
                    apiData = await resp.json();
                }else{
                    console.error('Error fetching book info by ISBN:', resp.statusText);
                }
            }

            // If no ISBN or not found, try search by title/author
            console.log('API data:', apiData);
            console.log('Row Title:', row.Title);
            console.log('Row title:', row.title);
            if (!apiData && row.title) {
                console.log('Searching for book:', row.title, 'by', row.author);
                const searchUrl = `https://openlibrary.org/search.json?title=${encodeURIComponent(row.title)}${row.author ? `&author=${encodeURIComponent(row.author)}` : ''}`;
                const searchResp = await fetch(searchUrl);
                    if (searchResp.ok) {
                        const searchData = await searchResp.json();
                        if (searchData.docs && searchData.docs.length > 0) {
                            const doc = searchData.docs[0];
                            isbn = doc.isbn?.[0] || '';
                            // Try to get full data if ISBN found
                            if (isbn) {
                                const resp = await fetch(`https://openlibrary.org/isbn/${isbn}.json`);
                                if (resp.ok) {
                                    apiData = await resp.json();
                                }
                            } else {
                                apiData = doc;
                            }
                        }
                    }
            }

            // Fill in missing fields from API
            if (apiData) {
                bookInfo.title = apiData.title || bookInfo.title;
                bookInfo.author = apiData.authors
                    ? (Array.isArray(apiData.authors)
                        ? (apiData.authors[0]?.name || bookInfo.author)
                        : bookInfo.author)
                    : (apiData.author_name?.[0] || bookInfo.author);
                bookInfo.isbn = isbn || bookInfo.isbn;
                bookInfo.edition = apiData.edition_key?.[0] || apiData.key?.split('/').pop() || bookInfo.edition;
                bookInfo.format = apiData.physical_format || bookInfo.format || '';
                bookInfo.cover = apiData.covers
                    ? `https://covers.openlibrary.org/b/id/${apiData.covers[0]}-L.jpg`
                    : (bookInfo.isbn ? `https://covers.openlibrary.org/b/isbn/${bookInfo.isbn}-L.jpg` : '');
            }
            // Fallback to default cover if no cover found
            if (!bookInfo.cover) {
                bookInfo.cover = 'https://covers.openlibrary.org/b/id/12345678-L.jpg'; // Placeholder cover
            }
            console.log('Book info:', bookInfo);
            return bookInfo;
      }));

      setEnrichedBooks(enriched);
    } catch (err) {
      setError('Failed to collect book info: ' + err.message);
    } finally {
      setCollecting(false);
    }
  };

  // 3. Import books to DB
  const handleImport = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: enrichedBooks }),
      });
      if (!response.ok) throw new Error('Failed to upload data');
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Get column keys
  const columnKeys = csvData[0] ? Object.keys(csvData[0]) : [];

  // Helper for rendering a row in react-window
  const TableRow = ({ index, style, data }) => {
    const row = data[index];
    return (
      <div
        className="grid border-b"
        style={{
          ...style,
          display: 'grid',
          gridTemplateColumns: `repeat(${columnKeys.length}, 1fr)`,
          alignItems: 'center',
        }}
      >
        {columnKeys.map((key, i) => (
          <div key={i} className="px-4 py-2 truncate border-r last:border-r-0">
            {row[key]}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="import-csv-container">
      <Head>
        <title>Import Books from CSV</title>
        <meta name="description" content="Import books from a CSV file" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="min-h-screen bg-white dark:bg-slate-800 dark:text-slate-400 pt-10 md:px-20 px-5">
        <Header />
        <div className="import-container w-full flex md:flex-row flex-col md:px-10 px-5">
          <div className="card-container md:flex-[50%]">
            <h1>Upload CSV</h1>
            <input type="file" accept=".csv" onChange={handleFileChange} />
            {fileName && <p>Selected file: {fileName}</p>}
            {error && <p className="error">{error}</p>}
            {success && <p className="success">Data uploaded successfully!</p>}
          </div>

          <div className="card-container md:flex-[50%] h-[80vh]">
            <h1>Uploaded Book List</h1>
            <div className="w-full">
              {/* Header */}
              <div
                className="grid bg-emerald-400 font-bold border-b text-white dark:text-black"
                style={{
                  gridTemplateColumns: `repeat(${columnKeys.length}, 1fr)`,
                }}
              >
                {columnKeys.map((key) => (
                  <div key={key} className="px-4 py-2">
                    {key}
                  </div>
                ))}
              </div>
              {/* Virtualized Rows */}
              {csvData.length > 0 && (
                <List
                  height={400}
                  itemCount={csvData.length}
                  itemSize={40}
                  width="100%"
                  itemData={csvData}
                >
                  {TableRow}
                </List>
              )}
              {csvData.length === 0 && <p>No data to display</p>}
            </div>
            <button className="mt-4" onClick={handleCollectInfo} disabled={collecting || csvData.length === 0}>
              {collecting ? 'Collecting...' : 'Collect Book Information'}
            </button>
            <div><span>{csvData.length} books uploaded</span></div>
          </div>
        </div>
        {/* Books to Import */}
        <div className="books-to-import mt-8">
          <h1>Books to Import</h1>
          {enrichedBooks.length === 0 && <p>No books collected yet.</p>}
          {enrichedBooks.length > 0 && (
            <>
              {/* Header */}
              <div
                className="grid bg-emerald-400 font-bold border-b text-white dark:text-black"
                style={{
                  gridTemplateColumns: `repeat(${Object.keys(enrichedBooks[0]).length}, 1fr)`,
                }}
              >
                {Object.keys(enrichedBooks[0]).map((key) => (
                  <div key={key} className="px-4 py-2">
                    {key}
                  </div>
                ))}
              </div>
              {/* Virtualized Rows */}
              <List
                height={400}
                itemCount={enrichedBooks.length}
                itemSize={40}
                width="100%"
                itemData={enrichedBooks}
              >
                {({ index, style, data }) => {
                  const row = data[index];
                  const columnKeys = Object.keys(row);
                  return (
                    <div
                      className="grid border-b"
                      style={{
                        ...style,
                        display: 'grid',
                        gridTemplateColumns: `repeat(${columnKeys.length}, 1fr)`,
                        alignItems: 'center',
                      }}
                    >
                      {columnKeys.map((key, i) => (
                        <div key={i} className="px-4 py-2 truncate border-r last:border-r-0">
                          {row[key]}
                        </div>
                      ))}
                    </div>
                  );
                }}
              </List>
              <button className="mt-4" onClick={handleImport} disabled={loading}>
                {loading ? 'Importing...' : 'Import Books'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}