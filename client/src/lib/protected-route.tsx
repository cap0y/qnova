import { ComponentType } from "react";
import { Route, RouteComponentProps } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";

interface ProtectedRouteProps {
  component: ComponentType<RouteComponentProps>;
  path: string;
}

export function ProtectedRoute({
  component: Component,
  path,
}: ProtectedRouteProps) {
  const { user } = useAuth();

  if (!user) {
    return <Redirect to="/auth" />;
  }

  return <Route path={path} component={Component} />;
}
