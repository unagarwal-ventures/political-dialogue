import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function HomePage() {
  const { user } = useAuth();

  return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-8">
      <div className="space-y-4">
        <h1 className="text-5xl font-bold text-gray-900 leading-tight">
          Find common ground across{' '}
          <span className="text-violet-600">the divide</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-xl mx-auto">
          Take a 13-question quiz, discover where you stand, and connect with someone who sees
          the world differently — for conversation, not debate.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link to="/quiz" className="btn-primary text-base px-8 py-3">
          Take the quiz
        </Link>
        {!user && (
          <Link to="/auth" className="btn-secondary text-base px-8 py-3">
            Sign in
          </Link>
        )}
      </div>

      <div className="grid grid-cols-3 gap-6 pt-12">
        {[
          {
            icon: '📊',
            title: '13 questions',
            desc: 'Covering economics, social issues, government, environment, and foreign policy',
          },
          {
            icon: '🎯',
            title: 'Your political profile',
            desc: 'See exactly where you stand on each axis — no partisan labels',
          },
          {
            icon: '🤝',
            title: 'Matched dialogue',
            desc: 'Connect with someone across the spectrum for civil, structured conversation',
          },
        ].map((item) => (
          <div key={item.title} className="card text-left space-y-2">
            <div className="text-3xl">{item.icon}</div>
            <div className="font-semibold text-gray-800">{item.title}</div>
            <p className="text-sm text-gray-500">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="card bg-violet-50 border-violet-100 text-left mt-8">
        <p className="text-sm text-violet-800 italic">
          "The goal is not to change minds — it's to understand how someone you disagree with
          arrived at their views, and to be genuinely understood in return."
        </p>
      </div>
    </div>
  );
}
