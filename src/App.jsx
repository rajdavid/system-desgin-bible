import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './components/HomePage';
import QuestionPage from './components/QuestionPage';
import MockInterview from './components/MockInterview';
import UrlShortener from './questions/url-shortener';
import ChatSystem from './questions/chat-system';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/mock" element={<MockInterview />} />
        <Route path="/q/url-shortener" element={<UrlShortener />} />
        <Route path="/q/chat-system" element={<ChatSystem />} />
        <Route path="/q/:slug" element={<QuestionPage />} />
      </Routes>
    </Layout>
  );
}

export default App;
