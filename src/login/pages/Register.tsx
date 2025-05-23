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
import MapBackground from "../../components/ui/MapBackground";
import TrackSwiftlyLogo from "../../components/ui/TrackSwiftlyLogo";

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
    const [hoveredArea, setHoveredArea] = useState<string | null>(null);

    // Instead of using Template, render our custom layout directly
    return (
        <div className="flex min-h-screen w-full">
            {/* Left Column - Interactive Map Section */}
            <div className="hidden md:block md:w-1/2 relative">
                <MapBackground hoveredArea={hoveredArea} onHoverArea={setHoveredArea} />
            </div>
            
            {/* Right Column - Registration Form Section */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-8">
                <div className="w-full max-w-md space-y-6">
                    <div className="mb-8">
                        <TrackSwiftlyLogo />
                    </div>
                    
                    <form id="kc-register-form" className="space-y-6" action={url.registrationAction} method="post">
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
                                className="w-full"
                            >
                                {msgStr("doRegister")}
                            </Button>
                            
                            <div className="text-center">
                                <a href={url.loginUrl} className={buttonVariants({ variant: "link" })}>
                                    {msg("backToLogin")}
                                </a>
                            </div>
                        </div>
                    </form>
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
