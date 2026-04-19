import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Construction } from 'lucide-react';
import { getQuestion } from '../data/questions';

export default function ComingSoon() {
  const { slug } = useParams();
  const q = getQuestion(slug);

  return (
    <div className="max-w-3xl mx-auto px-6 py-20 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cream-100 border border-ink-200 text-ink-600 mb-6">
        <Construction size={28} />
      </div>
      <h1 className="font-serif text-4xl font-medium text-ink-900 mb-3">
        {q ? q.title : 'Question'} — coming soon
      </h1>
      <p className="text-ink-600 mb-8">
        This one's being written up with the same depth as the URL Shortener. Check back soon.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-rust-600 hover:text-rust-700 font-medium"
      >
        <ArrowLeft size={16} />
        Back to all questions
      </Link>
    </div>
  );
}
