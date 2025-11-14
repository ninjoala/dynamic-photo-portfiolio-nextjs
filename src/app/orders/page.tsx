import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Orders - Coming Soon',
    description: 'Online ordering form for George Jenkins Band merchandise coming soon!',
};

export default function OrdersPage() {
    return (
        <div className="min-h-screen bg-stone-50 text-foreground flex items-center justify-center pt-6 pb-12 px-4">
            <div className="max-w-4xl w-full">
                <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-light mb-4 text-gray-900">
                            Dear George Jenkins Band Parents,
                        </h2>
                        <p className="text-xl text-gray-700 leading-relaxed">
                            We're excited to announce that our online ordering system for band photos is currently being set up and will be available here very soon!
                        </p>
                    </div>

                    <div className="border-t border-gray-200 pt-8 mt-8">
                            <div className="bg-gray-50 rounded-lg p-6 mb-8">
                                <h3 className="text-xl font-semibold mb-3 text-gray-900">Have Questions?</h3>
                                <p className="text-gray-600 mb-4">
                                    Feel free to reach out if you have any questions about the upcoming ordering system or need assistance.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 text-sm">
                                    <div className="flex items-center text-gray-700">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                                        </svg>
                                        nick@nickdobosmedia.com
                                    </div>
                                    <div className="flex items-center text-gray-700">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                                        </svg>
                                        (678) 850-6600
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    href="/contact"
                                    className="inline-block text-center bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors"
                                >
                                    Contact Us
                                </Link>
                                <Link
                                    href="/"
                                    className="inline-block text-center bg-gray-200 text-gray-900 px-8 py-3 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    Return to Homepage
                                </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
