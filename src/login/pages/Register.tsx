import { useState } from "react";
import type { LazyOrNot } from "keycloakify/tools/LazyOrNot";
import { getKcClsx, type KcClsx } from "keycloakify/login/lib/kcClsx";
import type { UserProfileFormFieldsProps } from "keycloakify/login/UserProfileFormFieldsProps";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import { Button, buttonVariants } from "../../components/ui/button";
import { checkboxVariants } from "../../components/ui/checkbox";
import { kcSanitize } from "keycloakify/lib/kcSanitize";
import TrackSwiftlyLogo from "../../components/ui/TrackSwiftlyLogo";
// import mapBackgroundImage from "../../assets/img/digital-map-with-road-network-highlights-routes-with-line-se/26aa712b-979e-4494-b7a0-457468712aca.jpg";
import mapBackgroundImage from "../../assets/img/OSIEU30.jpg";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { useImageLoader } from "../../hooks/useImageLoader";


type RegisterProps = PageProps<Extract<KcContext, { pageId: "register.ftl" }>, I18n> & {
    UserProfileFormFields: LazyOrNot<(props: UserProfileFormFieldsProps) => JSX.Element>;
    doMakeUserConfirmPassword: boolean;
};

export default function Register(props: RegisterProps) {
    const { kcContext, i18n, doUseDefaultCss, classes, UserProfileFormFields, doMakeUserConfirmPassword } = props;

    const { kcClsx } = getKcClsx({
        doUseDefaultCss,
        classes
    });

    const { url, messagesPerField, recaptchaRequired, recaptchaSiteKey, termsAcceptanceRequired } = kcContext;

    const { msg, msgStr } = i18n;

    const [isFormSubmittable, setIsFormSubmittable] = useState(false);
    const [areTermsAccepted, setAreTermsAccepted] = useState(false);
    const { isLoaded: bgLoaded } = useImageLoader(mapBackgroundImage);

    // Block the registration page from rendering until the background image is fully loaded
    if (!bgLoaded) {
        return <LoadingSpinner message="Setting up your registration..." />;
    }

    // Login-02 inspired layout matching Login.tsx structure
    return (
        <div className="grid min-h-svh lg:grid-cols-2">
            {/* Left Column - Registration Form Section */}
            <div className="flex flex-col gap-4 p-6 md:p-10">
                <div className="flex flex-1 items-center justify-center">
                    <div className="w-full max-w-xs space-y-6">
                        <div className="flex flex-col space-y-2 text-center">
                            <h1 className="text-2xl font-semibold tracking-tight">
                                Create an account
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Enter your details to create your account
                            </p>
            </div>
            
                        <form id="kc-register-form" className="space-y-4" action={url.registrationAction} method="post">
                        <UserProfileFormFields
                            kcContext={kcContext}
                            i18n={i18n}
                            kcClsx={kcClsx}
                            onIsFormSubmittableValueChange={setIsFormSubmittable}
                            doMakeUserConfirmPassword={doMakeUserConfirmPassword}
                        />
                        
                        {termsAcceptanceRequired && (
                            <TermsAcceptance
                                i18n={i18n}
                                kcClsx={kcClsx}
                                messagesPerField={messagesPerField}
                                areTermsAccepted={areTermsAccepted}
                                onAreTermsAcceptedValueChange={setAreTermsAccepted}
                            />
                        )}
                        
                        {recaptchaRequired && (
                            <div className="form-group">
                                <div className="g-recaptcha" data-size="compact" data-sitekey={recaptchaSiteKey}></div>
                            </div>
                        )}
                        
                        <div className="space-y-4">
                            <Button
                                disabled={!isFormSubmittable || (termsAcceptanceRequired && !areTermsAccepted)}
                                type="submit"
                                    className="w-full h-10"
                            >
                                {msgStr("doRegister")}
                            </Button>
                            
                            <div className="text-center">
                                    <span className="text-sm text-muted-foreground">
                                        Already have an account?{" "}
                                        <a 
                                            href={url.loginUrl} 
                                            className="font-medium text-primary underline underline-offset-4 hover:text-primary/90"
                                        >
                                            Sign in
                                        </a>
                                    </span>
                                </div>
                            </div>
                        </form>
                    </div>
                            </div>
                        </div>
            
            {/* Right Column - Static Map Background with Logo */}
            <div 
                className="relative hidden bg-muted lg:block bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: `url(${mapBackgroundImage})`
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

function TermsAcceptance(props: {
    i18n: I18n;
    kcClsx: KcClsx;
    messagesPerField: Pick<KcContext["messagesPerField"], "existsError" | "get">;
    areTermsAccepted: boolean;
    onAreTermsAcceptedValueChange: (areTermsAccepted: boolean) => void;
}) {
    const { i18n, kcClsx, messagesPerField, areTermsAccepted, onAreTermsAcceptedValueChange } = props;

    const { msg } = i18n;

    return (
        <div className="space-y-4">
            <div>
                <div className="text-foreground font-medium mb-2">{msg("termsTitle")}</div>
                <div id="kc-registration-terms-text" className="text-muted-foreground text-sm">
                    {msg("termsText")}
                </div>
            </div>
            
            <div>
                <div className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        id="termsAccepted"
                        name="termsAccepted"
                        className={checkboxVariants({})}
                        checked={areTermsAccepted}
                        onChange={e => onAreTermsAcceptedValueChange(e.target.checked)}
                        aria-invalid={messagesPerField.existsError("termsAccepted")}
                    />
                    <label htmlFor="termsAccepted" className="text-sm font-medium">
                        {msg("acceptTerms")}
                    </label>
                </div>
                {messagesPerField.existsError("termsAccepted") && (
                    <div className="mt-2">
                        <span
                            id="input-error-terms-accepted"
                            className="text-red-500 text-sm"
                            aria-live="polite"
                            dangerouslySetInnerHTML={{
                                __html: kcSanitize(messagesPerField.get("termsAccepted"))
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
