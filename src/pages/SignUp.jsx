import {
  Input,
  Button,
  Typography,
} from "@material-tailwind/react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from 'react-hot-toast';
import { FcGoogle } from "react-icons/fc";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebase/config"; // adjust path

export function SignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Basic validation
      if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
        setError("All fields are required");
        setIsLoading(false);
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        setIsLoading(false);
        return;
      }

      if (formData.password.length < 6) {
        setError("Password must be at least 6 characters long");
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Registration successful! Please sign in.');
        navigate('/sign-in');
      } else {
        throw new Error(data.message || 'Failed to create account');
      }
    } catch (error) {
      console.error("Error during sign up:", error);
      setError(error.message || 'An unexpected error occurred');
      toast.error(error.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  const googleProvider = new GoogleAuthProvider();

  const handleGoogleSignUp = async () => {
    try {
      setIsLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/google-signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: user.displayName,
          email: user.email,
          firebaseUid: user.uid,
        })
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', user.accessToken || 'mock-jwt-token');
        toast.success("Signed in with Google successfully!");
        const redirectPath = localStorage.getItem('redirectAfterLogin') || '/preorder';
        localStorage.removeItem('redirectAfterLogin');
        navigate(redirectPath, { replace: true });
      } else {
        throw new Error(data.message || "Google sign-in failed on server");
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      const errorMessage = error.message || 'Failed to sign in with Google';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="m-8 flex">
      <div className="w-2/5 h-full hidden lg:block">
        <img
          src="/img/Tastoria.jpg"
          className="h-full w-full object-cover rounded-3xl"
          alt="Tastoria"
        />
      </div>
      <div className="w-full lg:w-3/5 flex flex-col items-center justify-center">
        <div className="text-center">
          <Typography variant="h2" className="font-bold mb-4">Join Us</Typography>
          <Typography variant="paragraph" color="blue-gray" className="text-lg font-normal">
            Enter your details to register.
          </Typography>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Google Sign Up Button */}
        <button
          onClick={handleGoogleSignUp}
          className="flex items-center justify-center gap-2 w-full max-w-sm px-6 py-3 mt-6 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
        >
          <FcGoogle className="w-5 h-5" />
          <span className="font-medium">Continue with Google</span>
        </button>

        <div className="w-full max-w-sm mt-6 mb-4 flex items-center justify-center">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-4 text-gray-500 text-sm">OR</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        {/* Registration Form */}
        <form className="mt-8 mb-2 w-80 max-w-screen-lg sm:w-96" onSubmit={handleSubmit}>
          <div className="mb-4 flex flex-col gap-6">
            <Input
              size="lg"
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
            />
            <Input
              size="lg"
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
            />
            <Input
              type="password"
              size="lg"
              label="Password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
            />
            <Input
              type="password"
              size="lg"
              label="Confirm Password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
            />
          </div>
          <Button className="mt-6" fullWidth type="submit" disabled={isLoading}>
            {isLoading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>

        <Typography variant="paragraph" className="text-center text-blue-gray-500 font-medium mt-4">
          Already have an account?
          <Link to="/sign-in" className="text-gray-900 ml-1">Sign in</Link>
        </Typography>
      </div>
    </section>
  );
}

export default SignUp;
