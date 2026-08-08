const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";

type Web3FormsResponse = {
  message?: string;
  success?: boolean;
};

function getAccessKey(): string {
  const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY?.trim();

  if (!accessKey) {
    throw new Error(
      "Web3Forms is not configured yet. Add NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY to your environment.",
    );
  }

  return accessKey;
}

export async function submitWeb3Form(formData: FormData): Promise<string> {
  if (!formData.has("access_key")) {
    formData.append("access_key", getAccessKey());
  }

  if (!formData.has("botcheck")) {
    formData.append("botcheck", "");
  }

  const response = await fetch(WEB3FORMS_ENDPOINT, {
    method: "POST",
    headers: { Accept: "application/json" },
    body: formData,
  });

  const payload = (await response.json().catch(() => null)) as Web3FormsResponse | null;

  const message =
    payload?.message ||
    (response.ok ? "Your form has been submitted successfully." : "We could not submit the form right now.");

  if (!response.ok || payload?.success !== true) {
    throw new Error(message);
  }

  return message;
}
