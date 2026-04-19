import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './components/HomePage';
import UrlShortener from './questions/url-shortener';
import ComingSoon from './components/ComingSoon';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/q/url-shortener" element={<UrlShortener />} />
        <Route path="/q/:slug" element={<ComingSoon />} />
      </Routes>
    </Layout>
  );
}

export default App;
