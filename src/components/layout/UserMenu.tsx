import { useState } from "react";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { KeyRound, LogOut, Phone } from "lucide-react";
import { useT } from "@/i18n/LanguageProvider";
import {
  changePasswordSchema,
  updatePhoneSchema,
  type ChangePasswordValues,
  type UpdatePhoneValues,
} from "@/schemas/auth";
import { authApi } from "@/services/api/auth.api";
import { toast } from "sonner";
import { env } from "@/lib/env";
import { logoutDestination } from "@/lib/auth/logout";

export function UserMenu() {
  const { user, role, signOut, updateUser } = useAuth();
  const qc = useQueryClient();
  const t = useT();
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [phoneOpen, setPhoneOpen] = useState(false);
  const form = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { oldPassword: "", newPassword: "", confirmPassword: "" },
  });
  const phoneForm = useForm<UpdatePhoneValues>({
    resolver: zodResolver(updatePhoneSchema),
    defaultValues: { phone: user?.phone ?? "" },
  });
  if (!user) return null;
  const initials = user.fullName
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  async function changePassword(values: ChangePasswordValues) {
    try {
      await authApi.changePassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });
      toast.success(t("auth.passwordUpdated"));
      form.reset();
      setPasswordOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("auth.passwordUpdateFailed"));
    }
  }

  async function updatePhone(values: UpdatePhoneValues) {
    try {
      await authApi.updatePhone({ phone: values.phone });
      updateUser({ phone: values.phone });
      toast.success(t("auth.phoneUpdated"));
      setPhoneOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("auth.phoneUpdateFailed"));
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 rounded-full p-1 hover:bg-accent">
          <Avatar className="size-8">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="flex flex-col">
            <span className="text-sm font-medium">{user.fullName}</span>
            <span className="text-xs text-muted-foreground">{user.email}</span>
            <span className="mt-1 text-xs uppercase text-muted-foreground">{role}</span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setPhoneOpen(true)}>
            <Phone className="mr-2 size-4" /> {t("auth.updatePhone")}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setPasswordOpen(true)}>
            <KeyRound className="mr-2 size-4" /> {t("auth.changePassword")}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={async () => {
              await qc.cancelQueries().catch(() => undefined);
              let serverLogoutFailed = false;
              let centralLogoutRequired = false;

              try {
                const result = await authApi.logout();
                centralLogoutRequired = result.centralLogoutRequired;
                if (centralLogoutRequired) {
                  window.location.assign(logoutDestination(result, env.apiBaseUrl));
                  return;
                }
              } catch {
                serverLogoutFailed = true;
              }

              qc.clear();
              signOut();

              if (serverLogoutFailed) {
                toast.warning(t("auth.logoutServerWarning"));
              }

              window.location.assign(logoutDestination({ centralLogoutRequired }, env.apiBaseUrl));
            }}
          >
            <LogOut className="mr-2 size-4" /> {t("action.signOut")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={passwordOpen} onOpenChange={setPasswordOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("auth.changePassword")}</DialogTitle>
            <DialogDescription>{t("auth.changePasswordDesc")}</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={form.handleSubmit(changePassword)}>
            <PasswordField
              label={t("auth.oldPassword")}
              autoComplete="current-password"
              error={form.formState.errors.oldPassword?.message}
              input={form.register("oldPassword")}
            />
            <PasswordField
              label={t("auth.newPassword")}
              autoComplete="new-password"
              error={form.formState.errors.newPassword?.message}
              input={form.register("newPassword")}
            />
            <PasswordField
              label={t("auth.confirmNewPassword")}
              autoComplete="new-password"
              error={form.formState.errors.confirmPassword?.message}
              input={form.register("confirmPassword")}
            />
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? t("auth.updatingPassword") : t("action.save")}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={phoneOpen} onOpenChange={setPhoneOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("auth.updatePhone")}</DialogTitle>
            <DialogDescription>{t("auth.updatePhoneDesc")}</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={phoneForm.handleSubmit(updatePhone)}>
            <div className="space-y-2">
              <Label>{t("auth.phoneLabel")}</Label>
              <Input type="tel" placeholder="6281234567890" {...phoneForm.register("phone")} />
              {phoneForm.formState.errors.phone && (
                <p className="text-xs text-destructive">
                  {phoneForm.formState.errors.phone.message}
                </p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={phoneForm.formState.isSubmitting}>
              {t("action.save")}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

function PasswordField({
  label,
  autoComplete,
  error,
  input,
}: {
  label: string;
  autoComplete: string;
  error?: string;
  input: UseFormRegisterReturn;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input type="password" autoComplete={autoComplete} {...input} />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
