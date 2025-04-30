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
import backgroundImage from "../../assets/img/8359155.jpg";

export default function Login(props: PageProps<Extract<KcContext, { pageId: "login.ftl" }>, I18n>) {
    const [bgLoaded, setBgLoaded] = useState(false);
    const [progress, setProgress] = useState(13)

    useEffect(() => {
        const img = new Image();
        img.src = backgroundImage;
        img.onload = () => setBgLoaded(true);
    }, []);


    useEffect(() => {
        const timer = setTimeout(() => setProgress(66), 500)
        return () => clearTimeout(timer)
    }, [])


    

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
        <div id="kc-registration" className="text-center mt-4">
            <span className="text-foreground">
                {msgStr("noAccount")}{" "}
                <a tabIndex={8} href={url.registrationUrl} className="font-medium text-primary hover:text-primary/90">
                    {msgStr("doRegister")}
                </a>
            </span>
        </div>
    );
    
    const socialProvidersNode = social?.providers && social.providers.length > 0 ? (
        <div>
            <SocialProviders social={social} kcClsx={kcClsx} clsx={clsx} msg={msg} realm={realm} />
            <div className="relative my-6">
                <Separator className="absolute inset-0" />
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                        {msg("identity-provider-login-label") || "OR"}
                    </span>
                </div>
            </div>
        </div>
    ) : null;

    const formNode = (
        <div id="kc-form">
            <div id="kc-form-wrapper">
                {realm.password && (
                    <form
                        id="kc-form-login"
                        onSubmit={() => {
                            setIsLoginButtonDisabled(true);
                            return true;
                        }}
                        action={url.loginAction}
                        method="post"
                        className="space-y-6"
                    >
                        {!usernameHidden && (
                            <div>
                                <Label htmlFor="username" className="text-base font-medium">
                                    {!realm.loginWithEmailAllowed
                                        ? msg("username")
                                        : !realm.registrationEmailAsUsername
                                            ? msg("usernameOrEmail")
                                            : msg("email")}
                                </Label>
                                <Input
                                    tabIndex={2}
                                    id="username"
                                    className="mt-1"
                                    name="username"
                                    defaultValue={login.username ?? ""}
                                    type="text"
                                    autoFocus
                                    autoComplete="username"
                                    aria-invalid={messagesPerField.existsError("username", "password")}
                                />
                                {messagesPerField.existsError("username", "password") && (
                                    <div
                                        className="text-red-500 text-sm mt-1"
                                        aria-live="polite"
                                        dangerouslySetInnerHTML={{
                                            __html: kcSanitize(messagesPerField.getFirstError("username", "password"))
                                        }}
                                    />
                                )}
                            </div>
                        )}

                        <div>
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password" className="text-base font-medium">
                                    {msg("password")}
                                </Label>
                                {realm.resetPasswordAllowed && (
                                    <a 
                                        tabIndex={6} 
                                        href={url.loginResetCredentialsUrl}
                                        className="text-sm font-medium text-primary hover:text-primary/90"
                                    >
                                        {msgStr("doForgotPassword")}
                                    </a>
                                )}
                            </div>
                            <PasswordWrapper kcClsx={kcClsx} i18n={i18n} passwordInputId="password">
                                <Input
                                    tabIndex={3}
                                    id="password"
                                    className="mt-1"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    aria-invalid={messagesPerField.existsError("username", "password")}
                                />
                            </PasswordWrapper>
                            {usernameHidden && messagesPerField.existsError("username", "password") && (
                                <div
                                    className="text-red-500 text-sm mt-1"
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
                                <Label htmlFor="rememberMe" className="text-sm font-medium">
                                    {msgStr("rememberMe")}
                                </Label>
                            </div>
                        )}

                        <div id="kc-form-buttons" className={kcClsx("kcFormGroupClass")}>
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
                                className="w-full py-2"
                            >
                                {msgStr("doLogIn")}
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );

    // Instead of using Template, render our custom layout directly
    return (
        <div className="flex min-h-screen w-full">
            {/* Left Column - Visual Testimonial Section */}
            <div className="hidden md:flex md:w-1/2 relative bg-slate-100">
                <div className="w-full h-full relative">
                    <img 
                        src={backgroundImage} 
                        alt="side background of trackswitfly"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-10 left-10 text-white p-6 max-w-md z-10">
                        <p className="text-3xl font-bold mb-2">"Simply all the tools that my team and I need."</p>
                        <p className="text-xl font-medium">Karen Yue</p>
                        <p className="text-lg font-light">Director of Digital Marketing Technology</p>
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-30"></div>
                </div>
            </div>
            
            {/* Right Column - Login Form Section */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-8">
                <div className="w-full max-w-md space-y-6">
                    <div className="text-center mb-4">
                        <h1 className="text-2xl font-bold">{headerNode}</h1>
                    </div>
                    
                    {socialProvidersNode}
                    
                    {formNode}
                    
                    {displayInfo && infoNode}
                </div>
            </div>
        </div>
    );
}