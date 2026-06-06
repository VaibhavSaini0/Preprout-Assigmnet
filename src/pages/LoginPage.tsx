import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTestContext } from '../context/TestContext';
import { Logo, IconLoginIllustration } from '../components/icons/Icons';
import { InputField, CheckboxField } from '../components/ui/FormField';
import { isMockMode, setMockMode } from '../services/api';
import Alert from '../components/ui/Alert';
import Button from '../components/ui/Button';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loading, error } = useTestContext();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [userIdError, setUserIdError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [mockEnabled, setMockEnabled] = useState(isMockMode());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserIdError('');
    setPasswordError('');

    let hasError = false;
    if (!userId.trim()) {
      setUserIdError('User ID is required');
      hasError = true;
    }
    if (!password) {
      setPasswordError('Password is required');
      hasError = true;
    }
    if (hasError) return;

    try {
      await login(userId.trim(), password);
      navigate('/dashboard');
    } catch {
      // Error shown via context
    }
  };

  return (
    <div className="flex min-h-screen bg-bg-page flex-col lg:flex-row">
      {/* Illustration Section */}
      <div className="lg:flex-1 flex items-center justify-center p-3xl bg-bg-card lg:border-r lg:border-border max-lg:py-2xl max-lg:min-h-[240px] max-lg:border-b max-lg:border-border [&_svg]:max-lg:max-w-[240px] [&_svg]:max-lg:h-auto">
        <IconLoginIllustration />
      </div>

      {/* Form Section */}
      <div className="lg:flex-1 flex items-center justify-center p-xl bg-bg-page max-lg:py-2xl max-lg:px-lg">
        <div className="w-full max-w-[580px] min-h-fit bg-bg-card border border-[#bfdbfe] rounded-lg p-3xl flex flex-col justify-center shadow-[0_4px_20px_-2px_rgba(89,136,239,0.05)] max-lg:p-2xl max-lg:border-none max-lg:bg-transparent max-sm:max-w-full">
          <Logo className="mb-3xl self-start" />
          <h1 className="text-lg font-semibold leading-lg text-text-heading mb-xs">Login</h1>
          <p className="text-xs leading-xs text-text-main mb-2xl">Use your company provided Login credentials</p>

          {error && <Alert variant="error" className="mb-lg">{error}</Alert>}

          <form className="flex flex-col gap-xl" onSubmit={handleSubmit} noValidate>
            <InputField
              label="User ID"
              placeholder="Enter User ID"
              value={userId}
              onChange={(e) => {
                setUserId(e.target.value);
                if (e.target.value.trim()) setUserIdError('');
              }}
              error={userIdError}
              disabled={loading}
              required
            />
            <InputField
              label="Password"
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (e.target.value) setPasswordError('');
              }}
              error={passwordError}
              disabled={loading}
              required
            />
            <div className="-mt-xs mb-xs">
              <CheckboxField
                label="Run in Offline Mock Mode"
                checked={mockEnabled}
                onChange={(checked) => {
                  setMockEnabled(checked);
                  setMockMode(checked);
                }}
              />
            </div>
            {mockEnabled && (
              <div className="bg-bg-page border border-border rounded-sm p-md text-xs text-text-main leading-normal flex flex-col gap-xs">
                <strong>Mock Mode Credentials:</strong>
                <div>
                  User ID: <code className="bg-bg-card px-1.5 py-0.5 border border-border rounded-sm font-mono text-sm inline-block w-fit">vedant-admin</code>
                </div>
                <div>
                  Password: <code className="bg-bg-card px-1.5 py-0.5 border border-border rounded-sm font-mono text-sm inline-block w-fit">vedant123</code>
                </div>
              </div>
            )}
            <a
              href="#"
              className="text-sm leading-sm text-text-link self-start -mt-sm"
              onClick={(e) => e.preventDefault()}
            >
              Forgot password?
            </a>
            <Button type="submit" fullWidth disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
