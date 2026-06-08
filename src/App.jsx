import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import LandingPage from './components/LandingPage';
import HomePage from './components/HomePage';
import DsaTracker from './components/DsaTracker';
import QuestionPage from './components/QuestionPage';
import MockInterview from './components/MockInterview';
import UrlShortener from './questions/url-shortener';
import ChatSystem from './questions/chat-system';
import NewsFeed from './questions/news-feed';
import YouTube from './questions/youtube';
import Uber from './questions/uber';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/system-design" element={<HomePage />} />
        <Route path="/dsa" element={<DsaTracker />} />
        <Route path="/mock" element={<MockInterview />} />
        <Route path="/q/url-shortener" element={<UrlShortener />} />
        <Route path="/q/chat-system" element={<ChatSystem />} />
        <Route path="/q/news-feed" element={<NewsFeed />} />
        <Route path="/q/youtube" element={<YouTube />} />
        <Route path="/q/uber" element={<Uber />} />
        <Route path="/q/:slug" element={<QuestionPage />} />
      </Routes>
    </Layout>
  );
}

export default App;
