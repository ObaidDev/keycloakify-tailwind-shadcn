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
import MapBackground from "../../components/ui/MapBackground";

export default function LoginUsername(props: PageProps<Extract<KcContext, { pageId: "login-username.ftl" }>, I18n>) {
    const [bgLoaded, setBgLoaded] = useState(false);
    const [hoveredArea, setHoveredArea] = useState<string | null>(null);

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
        <div id="kc-registration" className="text-center mt-4">
            <span className="text-foreground">
                {msgStr("noAccount")}{" "}
                <a tabIndex={6} href={url.registrationUrl} className="font-medium text-primary hover:text-primary/90">
                    {msgStr("doRegister")}
                </a>
            </span>
        </div>
    ) : null;
    
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
                                    autoComplete="off"
                                    aria-invalid={messagesPerField.existsError("username")}
                                />
                                {messagesPerField.existsError("username") && (
                                    <div className="text-red-500 text-sm mt-1" aria-live="polite">
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
                                <Label htmlFor="rememberMe" className="text-sm font-medium">
                                    {msgStr("rememberMe")}
                                </Label>
                            </div>
                        )}

                        <div id="kc-form-buttons" className={kcClsx("kcFormGroupClass")}>
                            <Button 
                                tabIndex={4} 
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
            {/* Left Column - Interactive Map Section */}
            <div className="hidden md:block md:w-1/2 relative">
                <MapBackground hoveredArea={hoveredArea} onHoverArea={setHoveredArea} />
            </div>
            
            {/* Right Column - Login Form Section */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-8">
                <div className="w-full max-w-md space-y-6">
                    <div className="mb-8">
                        <TrackSwiftlyLogo />
                    </div>
                    
                    {socialProvidersNode}
                    
                    {formNode}
                    
                    {infoNode}
                </div>
            </div>
        </div>
    );
}
