import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'GoodShift | Creative & Digital Solutions | Website Quotations',description:'Explore our professional informational website packages and request a tailored quotation.',icons:{icon:'/goodshift-icon.png',apple:'/goodshift-icon.png'},robots:{index:true,follow:true}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
