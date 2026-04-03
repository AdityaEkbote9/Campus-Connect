import { useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";

export const GoogleLoginButton = () => {
  const { loginWithGoogle } = useAuth();
  const buttonRef = useRef(null);

  useEffect(() => {
    if (!buttonRef.current) {
      return undefined;
    }

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      buttonRef.current.innerHTML =
        "<p class='helper-text'>Set VITE_GOOGLE_CLIENT_ID to enable Google sign-in.</p>";
      return undefined;
    }

    let intervalId;
    let isCancelled = false;

    const renderGoogleButton = () => {
      if (!buttonRef.current || !window.google?.accounts?.id || isCancelled) {
        return false;
      }

      const buttonWidth = Math.min(buttonRef.current.parentElement?.clientWidth ?? 460, 460);

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async ({ credential }) => {
          try {
            await loginWithGoogle(credential);
            window.location.assign("/dashboard");
          } catch (error) {
            window.alert(error.message);
          }
        }
      });

      buttonRef.current.innerHTML = "";
      window.google.accounts.id.renderButton(buttonRef.current, {
        type: "standard",
        shape: "pill",
        theme: "outline",
        text: "signin_with",
        size: "large",
        width: buttonWidth
      });

      return true;
    };

    buttonRef.current.innerHTML = "<p class='helper-text'>Loading Google sign-in…</p>";

    if (!renderGoogleButton()) {
      intervalId = window.setInterval(() => {
        if (renderGoogleButton() && intervalId) {
          window.clearInterval(intervalId);
        }
      }, 250);
    }

    return () => {
      isCancelled = true;
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [loginWithGoogle]);

  return <div ref={buttonRef} className="google-login-button" />;
};
