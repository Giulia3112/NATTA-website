import { firebaseAuth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { useState } from "react";
import { useLocation } from "wouter";
import { useFirebaseAuth } from "@/contexts/AuthContext";
import { Spinner } from "@/components/ui/spinner";

export default function Login() {
  const [, setLocation] = useLocation();
  const { firebaseUser, firebaseLoading } = useFirebaseAuth();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // If already authenticated, redirect to dashboard
  if (!firebaseLoading && firebaseUser) {
    setLocation("/dashboard");
    return null;
  }

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(firebaseAuth, provider);
      setLocation("/dashboard");
    } catch (err: any) {
      setError(getErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "signin") {
        await signInWithEmailAndPassword(firebaseAuth, email, password);
      } else {
        await createUserWithEmailAndPassword(firebaseAuth, email, password);
      }
      setLocation("/dashboard");
    } catch (err: any) {
      setError(getErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  if (firebaseLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">NATTA</h1>
        <p className="text-muted-foreground mt-1">
          Descubra e gerencie suas oportunidades
        </p>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            {mode === "signin" ? "Entrar na conta" : "Criar conta"}
          </CardTitle>
          <CardDescription>
            {mode === "signin"
              ? "Acesse sua conta para continuar"
              : "Crie sua conta gratuitamente"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Google Sign-In */}
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <GoogleIcon />
            Continuar com Google
          </Button>

          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">ou</span>
            <Separator className="flex-1" />
          </div>

          {/* Email / Password form */}
          <form onSubmit={handleEmailAuth} className="space-y-3">
            {mode === "signup" && (
              <div className="space-y-1">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  placeholder="Seu nome"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  disabled={loading}
                />
              </div>
            )}

            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder={mode === "signup" ? "Mínimo 6 caracteres" : "Sua senha"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <Spinner className="mr-2 h-4 w-4" />
              ) : null}
              {mode === "signin" ? "Entrar" : "Criar conta"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            {mode === "signin" ? (
              <>
                Não tem conta?{" "}
                <button
                  type="button"
                  onClick={() => { setMode("signup"); setError(null); }}
                  className="text-primary font-medium hover:underline"
                >
                  Criar conta
                </button>
              </>
            ) : (
              <>
                Já tem conta?{" "}
                <button
                  type="button"
                  onClick={() => { setMode("signin"); setError(null); }}
                  className="text-primary font-medium hover:underline"
                >
                  Entrar
                </button>
              </>
            )}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}

function getErrorMessage(code: string): string {
  switch (code) {
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Email ou senha incorretos.";
    case "auth/email-already-in-use":
      return "Este email já está cadastrado.";
    case "auth/weak-password":
      return "A senha deve ter pelo menos 6 caracteres.";
    case "auth/invalid-email":
      return "Email inválido.";
    case "auth/too-many-requests":
      return "Muitas tentativas. Tente novamente mais tarde.";
    case "auth/popup-closed-by-user":
      return "Login cancelado.";
    case "auth/network-request-failed":
      return "Erro de conexão. Verifique sua internet.";
    default:
      return "Ocorreu um erro. Tente novamente.";
  }
}
