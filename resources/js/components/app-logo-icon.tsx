import { HTMLAttributes } from 'react';

export default function AppLogoIcon(props: HTMLAttributes<HTMLImageElement>) {
    return (
        <img 
            src="/image/logo.png" 
            alt="TK Paradise Logo"
            {...props}
        />
    );
}
