import { useAuth } from '../hooks/useAuth';
import { Logo } from '../components/icons/Icons';
import { InputField } from '../components/ui/FormField';
import Alert from '../components/ui/Alert';
import Button from '../components/ui/Button';

export default function LoginPage() {
  const {
    userId,
    setUserId,
    password,
    setPassword,
    userIdError,
    setUserIdError,
    passwordError,
    setPasswordError,
    handleSubmit,
    loading,
    error,
  } = useAuth();

  return (
    <div className="flex min-h-screen bg-bg-page flex-col lg:flex-row">
      <div className="lg:flex-1 flex items-center justify-center p-3xl bg-gradient-to-br from-bg-page to-primary-light/30 lg:border-r lg:border-border max-lg:py-2xl max-lg:min-h-[220px] max-lg:border-b max-lg:border-border [&_svg]:max-lg:max-w-[220px] [&_svg]:max-lg:h-auto">
        <img
          src="/Login/image.png"
          alt="Login Illustration"
          className="w-full max-w-[480px] h-auto object-contain max-lg:max-w-[220px]"
        />
      </div>

      <div className="lg:flex-1 flex items-center justify-center p-xl bg-bg-card max-lg:py-2xl max-lg:px-lg">
        <div className="w-full max-w-[480px] bg-bg-card  flex flex-col justify-center  max-lg:p-2xl max-sm:max-w-full">
          <Logo className="mb-3xl self-start " />
          <h1 className="text-xl font-semibold text-text-heading mb-xs">Login</h1>
          <p className="text-sm text-text-subtle mb-2xl">Use your company provided login credentials</p>

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
            <a
              href="#"
              className="text-sm text-text-link self-start -mt-sm hover:underline"
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
