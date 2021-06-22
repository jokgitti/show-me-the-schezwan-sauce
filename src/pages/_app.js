// eslint-disable-next-line import/no-extraneous-dependencies
import 'tailwindcss/tailwind.css';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
    return (
        <main className="bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 min-h-screen">
            <div className="container mx-auto px-4 pt-8 pb-8">
                <Component {...pageProps} />
            </div>
        </main>
    );
}

export default MyApp;
