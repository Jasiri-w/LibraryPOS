import {
    FaSearch,
    FaHashtag,
    FaRegBell,
    FaUserCircle,
    FaMoon,
    FaSun,
  } from 'react-icons/fa';
  import useDarkMode from '../../hooks/useDarkMode';
  import Link from 'next/link';
  import Image from 'next/image';
  

const Header = () => {
    return (
        <div className='header'>
            {/*<HashtagIcon />*/}
            <div className=""><Logo/></div>
            <Title />
            <ThemeIcon />
            <ToggleNavigation/>
            <FullScreenNavigation />
            {/*<Search />
            <BellIcon />
            <UserCircle />*/}
        </div>
    );
};

const FullScreenNavigation = () => {
    const toggleNavigation = (event) => {
        const navigation = document.querySelector('.nav');
        navigation.classList.toggle('active');
    };


    return (
        <div className='text-white transition-all transition-duration-150 ease-in-out full-screen-navigation w-screen h-screen z-9999 bg-black/50 backdrop-blur-md nav'>
            <div className='full-screen-navigation-close' onClick={toggleNavigation}>
                <span>&#10006;</span>
            </div>
            <div className='text-4xl full-screen-navigation-content w-[20%] h-[80%] mx-auto mt-40'>
                <ul className='full-screen-navigation-list m-auto text-center'>
                    <li><Link href="/">Home</Link></li>
                    <li><Link href="/all-books">Browse Full Library Catalog</Link></li>
                    <li><Link href="/all-books#search-section" legacyBehavior><FaSearch size='20' className='search-icon' />Search</Link></li>
                </ul>
            </div>
        </div>
    );
}

const ToggleNavigation = () => {
    const toggleNavigation = (event) => {
        const navigation = document.querySelector('.nav');
        navigation.classList.toggle('active');
    };

    return (
        <div className='toggle-navigation ml-5' onClick={toggleNavigation}>
            <div className='toggle-navigation-icon'>
                <span style={{fontSize : "30px", cursor: "pointer"}}>&#9776;</span>
            </div>
        </div>
    );
}

const ThemeIcon = () => {
    const [darkTheme, setDarkTheme] = useDarkMode();
    const handleMode = () => setDarkTheme(!darkTheme);
    return (
        <span onClick={handleMode}>
        {darkTheme ? (
            <FaSun size='24' className='top-navigation-icon' />
        ) : (
            <FaMoon size='24' className='top-navigation-icon' />
        )}
        </span>
    );
};

const Search = () => (
    <div className='search'>
        <input className='search-input' type='text' placeholder='Search...' />
        <FaSearch size='18' className='text-secondary my-auto' />
    </div>
);
const BellIcon = () => <FaRegBell size='24' className='top-navigation-icon' />;
const UserCircle = () => <FaUserCircle size='24' className='top-navigation-icon' />;
const HashtagIcon = () => <FaHashtag size='20' className='title-hashtag' />;
const Logo = () => <picture><img src="/logo.png" className="static responsive" style={{ maxHeight: '4em'}}/></picture>;
const Title = () => <h5 className='title-text'><Link href="\">Library</Link></h5>;
  
export default Header;