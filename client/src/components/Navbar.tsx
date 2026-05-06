import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="text-lg font-semibold text-violet-700 tracking-tight">
          Common Ground
        </Link>
        <div className="flex items-center gap-4 text-sm">
          {user ? (
            <>
              <Link to="/quiz" className="text-gray-600 hover:text-gray-900">Quiz</Link>
              <Link to="/matches" className="text-gray-600 hover:text-gray-900">Matches</Link>
              <Link to="/settings" className="text-gray-600 hover:text-gray-900">Settings</Link>
              <button onClick={handleSignOut} className="btn-secondary text-xs px-3 py-1.5">
                Sign out
              </button>
            </>
          ) : (
            <Link to="/auth" className="btn-primary">Get started</Link>
          )}
        </div>
      </div>
    </nav>
  );
}
