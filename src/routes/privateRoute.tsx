import { Navigate, Outlet } from "react-router-dom";

type PrivateRouteProps = {
    allowedRoles:string[];
}

export function PrivateRoute({allowedRoles}:PrivateRouteProps){
    const user = JSON.parse(localStorage.getItem('user')|| '{}');
    const isAuthenticated = !!user?.token;
    const userRole = user?.role;
    
    if(!isAuthenticated) return <Navigate to="/sign-in" replace/>
    if(!allowedRoles.includes(userRole))return <Navigate to="/404" replace/>
    return <Outlet/>;
}