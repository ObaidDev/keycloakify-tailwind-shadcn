import { useState, useEffect } from "react";
import { clsx } from "keycloakify/tools/clsx";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import { getKcClsx } from "keycloakify/login/lib/kcClsx";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { checkboxVariants } from "../../components/ui/checkbox";
import { Separator } from "../../components/ui/separator";
import { PasswordWrapper } from "../../components/ui/PasswordWrapper";
import SocialProviders from "../../components/ui/SocialProviders";
import { kcSanitize } from "keycloakify/lib/kcSanitize";
import TrackSwiftlyLogo from "../../components/ui/TrackSwiftlyLogo";
import MapBackground from "../../components/ui/MapBackground";

export default function Login(props: PageProps<Extract<KcContext, { pageId: "login.ftl" }>, I18n>) {
    const [bgLoaded, setBgLoaded] = useState(false);
    const [hoveredArea, setHoveredArea] = useState<string | null>(null);

    useEffect(() => {
        setBgLoaded(true);
    }, []);

    const { kcContext, i18n, doUseDefaultCss, classes } = props;

    const { kcClsx } = getKcClsx({
        doUseDefaultCss,
        classes
    });

    const { social, realm, url, usernameHidden, login, auth, registrationDisabled, messagesPerField } = kcContext;

    const { msg, msgStr } = i18n;

    const [isLoginButtonDisabled, setIsLoginButtonDisabled] = useState(false);

    const headerNode = msg("loginAccountTitle");
    const displayInfo = realm.password && realm.registrationAllowed && !registrationDisabled;
    const displayMessage = !messagesPerField.existsError("username", "password");
    
    // block the login page from rendering until the background image is fully loaded
    if (!bgLoaded) {
        return (
          <div className="w-screen h-screen flex items-center justify-center bg-black">
            <span className="text-white text-lg">Loading...</span>
          </div>
        );
    }

    const infoNode = (
        <div className="text-center mt-6">
            <span className="text-sm text-muted-foreground">
                {msgStr("noAccount")}{" "}
                <a 
                    tabIndex={8} 
                    href={url.registrationUrl} 
                    className="font-medium text-primary underline underline-offset-4 hover:text-primary/90"
                >
                    {msgStr("doRegister")}
                </a>
            </span>
        </div>
    );
    
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
                                autoComplete="username"
                                aria-invalid={messagesPerField.existsError("username", "password")}
                                className="h-10"
                            />
                            {messagesPerField.existsError("username", "password") && (
                                <div
                                    className="text-sm font-medium text-destructive"
                                    aria-live="polite"
                                    dangerouslySetInnerHTML={{
                                        __html: kcSanitize(messagesPerField.getFirstError("username", "password"))
                                    }}
                                />
                            )}
                        </div>
                    )}

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                {msg("password")}
                            </Label>
                            {realm.resetPasswordAllowed && (
                                <a 
                                    tabIndex={6} 
                                    href={url.loginResetCredentialsUrl}
                                    className="text-sm font-medium text-primary underline underline-offset-4 hover:text-primary/90"
                                >
                                    {msgStr("doForgotPassword")}
                                </a>
                            )}
                        </div>
                        <PasswordWrapper kcClsx={kcClsx} i18n={i18n} passwordInputId="password">
                            <Input
                                tabIndex={3}
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                aria-invalid={messagesPerField.existsError("username", "password")}
                                className="h-10"
                            />
                        </PasswordWrapper>
                        {usernameHidden && messagesPerField.existsError("username", "password") && (
                            <div
                                className="text-sm font-medium text-destructive"
                                aria-live="polite"
                                dangerouslySetInnerHTML={{
                                    __html: kcSanitize(messagesPerField.getFirstError("username", "password"))
                                }}
                            />
                        )}
                    </div>

                    {realm.rememberMe && !usernameHidden && (
                        <div className="flex items-center space-x-2">
                            <input
                                tabIndex={5}
                                id="rememberMe"
                                className={clsx(checkboxVariants({}), "")}
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
                        <Input 
                            type="hidden" 
                            id="id-hidden-input" 
                            name="credentialId" 
                            value={auth.selectedCredential} 
                        />
                        <Button 
                            tabIndex={7} 
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

    // Login-02 inspired layout with your animated map
    return (
        <div className="grid min-h-svh lg:grid-cols-2">
            {/* Left Column - Login Form Section (login-02 inspired) */}
            <div className="flex flex-col gap-4 p-6 md:p-10">
                <div className="flex flex-1 items-center justify-center">
                    <div className="w-full max-w-xs space-y-6">
                        <div className="flex flex-col space-y-2 text-center">
                            <h1 className="text-2xl font-semibold tracking-tight">
                                Welcome back
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Enter your credentials to sign in to your account
                            </p>
                        </div>
                        
                        {socialProvidersNode}
                        
                        {formNode}
                        
                        {displayInfo && infoNode}
                    </div>
                </div>
            </div>
            
            {/* Right Column - Your Animated Map Section with Logo */}
            <div className="relative hidden bg-muted lg:block">
                <MapBackground hoveredArea={hoveredArea} onHoverArea={setHoveredArea} />
                {/* Logo overlay on the map */}
                <div className="absolute top-10 left-10 z-10">
                    <TrackSwiftlyLogo />
                </div>
            </div>
        </div>
    );
}