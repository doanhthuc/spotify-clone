import {
    HomeIcon,
    HeartIcon,
    LibraryIcon,
    PlusCircleIcon,
    RssIcon,
    SearchIcon,
} from '@heroicons/react/outline';
import { signOut, useSession } from 'next-auth/react';
import IconButton from './IconButton';

const Divider = () => <hr className='border-t-[0.1px] border-gray-900' />;

const Sidebar = () => {
    const { data: session } = useSession();

    return (
        <div className='text-gray-500 px-5 pt-5 pb-36 text-xs border-r border-gray-900 h-screen overflow-y-scroll scrollbar-hidden sx:max-w-[12rem] lg:max-w-[15rem] hidden md:block'>
            <div className='space-y-4'>
                {session?.user && (
                    <button onClick={() => signOut()}>
                        {session?.user.name} - Logout
                    </button>
                )}

                <IconButton icon={HomeIcon} label='Home' />
                <IconButton icon={SearchIcon} label='Search' />
                <IconButton icon={LibraryIcon} label='Library' />

                <Divider />

                <IconButton icon={PlusCircleIcon} label='Create PlayList' />
                <IconButton icon={HeartIcon} label='Liked Songs' />
                <IconButton icon={RssIcon} label='Your Episodes' />

                <Divider />

                <p className='cursor-pointer hover:text-white'></p>
            </div>
        </div>
    );
};

export default Sidebar;
