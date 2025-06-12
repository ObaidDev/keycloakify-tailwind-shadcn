import { useState, useEffect } from "react";
import { clsx } from "keycloakify/tools/clsx";
import { getKcClsx } from "keycloakify/login/lib/kcClsx";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import { checkboxVariants } from "../../components/ui/checkbox";
import { Separator } from "../../components/ui/separator";
import { SocialProviders } from "../../components/ui/SocialProviders";
import TrackSwiftlyLogo from "../../components/ui/TrackSwiftlyLogo";

export default function LoginUsername(props: PageProps<Extract<KcContext, { pageId: "login-username.ftl" }>, I18n>) {
    const [bgLoaded, setBgLoaded] = useState(false);

    useEffect(() => {
        setBgLoaded(true);
    }, []);

    const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

    const { kcClsx } = getKcClsx({
        doUseDefaultCss,
        classes
    });

    const { social, realm, url, usernameHidden, login, registrationDisabled, messagesPerField } = kcContext;

    const { msg, msgStr } = i18n;

    const [isLoginButtonDisabled, setIsLoginButtonDisabled] = useState(false);

    // Block the login page from rendering until the background image is fully loaded
    if (!bgLoaded) {
        return (
            <div className="w-screen h-screen flex items-center justify-center bg-black">
                <span className="text-white text-lg">Loading...</span>
            </div>
        );
    }

    const displayInfo = realm.password && realm.registrationAllowed && !registrationDisabled;
    
    const infoNode = displayInfo ? (
        <div className="text-center mt-6">
            <span className="text-sm text-muted-foreground">
                {msgStr("noAccount")}{" "}
                <a 
                    tabIndex={6} 
                    href={url.registrationUrl} 
                    className="font-medium text-primary underline underline-offset-4 hover:text-primary/90"
                >
                    {msgStr("doRegister")}
                </a>
            </span>
        </div>
    ) : null;
    
    const socialProvidersNode = social?.providers && social.providers.length > 0 ? (
        <div className="space-y-4">
            <SocialProviders social={social} kcClsx={kcClsx} clsx={clsx} msg={msg} realm={realm} />
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                        {msg("identity-provider-login-label") || "OR"}
                    </span>
                </div>
            </div>
        </div>
    ) : null;

    const formNode = (
        <div className="space-y-6">
            {realm.password && (
                <form
                    id="kc-form-login"
                    onSubmit={() => {
                        setIsLoginButtonDisabled(true);
                        return true;
                    }}
                    action={url.loginAction}
                    method="post"
                    className="space-y-4"
                >
                    {!usernameHidden && (
                        <div className="space-y-2">
                            <Label htmlFor="username" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                {!realm.loginWithEmailAllowed
                                    ? msg("username")
                                    : !realm.registrationEmailAsUsername
                                      ? msg("usernameOrEmail")
                                      : msg("email")}
                            </Label>
                            <Input
                                tabIndex={2}
                                id="username"
                                name="username"
                                defaultValue={login.username ?? ""}
                                type="text"
                                autoFocus
                                autoComplete="off"
                                aria-invalid={messagesPerField.existsError("username")}
                                className="h-10"
                            />
                            {messagesPerField.existsError("username") && (
                                <div className="text-sm font-medium text-destructive" aria-live="polite">
                                    {messagesPerField.getFirstError("username")}
                                </div>
                            )}
                        </div>
                    )}

                    {realm.rememberMe && !usernameHidden && (
                        <div className="flex items-center space-x-2">
                            <input
                                tabIndex={3}
                                className={clsx(checkboxVariants({}), "")}
                                id="rememberMe"
                                name="rememberMe"
                                type="checkbox"
                                defaultChecked={!!login.rememberMe}
                            />
                            <Label htmlFor="rememberMe" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                {msgStr("rememberMe")}
                            </Label>
                        </div>
                    )}

                    <div className="space-y-4">
                        <Button 
                            tabIndex={4} 
                            disabled={isLoginButtonDisabled} 
                            type="submit" 
                            className="w-full h-10"
                        >
                            {msgStr("doLogIn")}
                        </Button>
                    </div>
                </form>
            )}
        </div>
    );

    // Login-02 inspired layout matching Login.tsx structure
    return (
        <div className="grid min-h-svh lg:grid-cols-2">
            {/* Left Column - Login Form Section */}
            <div className="flex flex-col gap-4 p-6 md:p-10">
                <div className="flex flex-1 items-center justify-center">
                    <div className="w-full max-w-xs space-y-6">
                        <div className="flex flex-col space-y-2 text-center">
                            <h1 className="text-2xl font-semibold tracking-tight">
                                Welcome back
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Enter your username to continue to your account
                            </p>
                        </div>
                        
                        {socialProvidersNode}
                        
                        {formNode}
                        
                        {infoNode}
                    </div>
                </div>
            </div>
            
            {/* Right Column - Static Map Background with Logo */}
            <div 
                className="relative hidden bg-muted lg:block bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: "url('/backgrounds/digital-map-with-road-network-highlights-routes-with-line-se/26aa712b-979e-4494-b7a0-457468712aca.jpg')"
                }}
            >
                {/* Dark overlay for better logo visibility */}
                <div className="absolute inset-0 bg-black/20"></div>
                {/* Logo overlay on the image */}
                <div className="absolute bottom-10 left-10 z-10">
                    <TrackSwiftlyLogo />
                </div>
            </div>
        </div>
    );
}
