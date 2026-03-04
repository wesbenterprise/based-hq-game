import './globals.css';

export const metadata = {
  title: 'BASeD HQ',
  description: 'An Earthbound-style exploration of BASeD HQ — walk through the building, meet the team.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
