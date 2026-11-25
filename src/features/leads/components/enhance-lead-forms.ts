import type { AppError } from '@/lib/result';
import { submitForm } from '@/lib/submit-form';

type FormState = 'idle' | 'sending' | 'success' | 'invalid' | 'rate-limited' | 'error';
type ResultState = Exclude<FormState, 'idle' | 'sending'>;

const MESSAGE_KEYS: Record<ResultState, string> = {
  success: 'messageSuccess',
  invalid: 'messageInvalid',
  'rate-limited': 'messageRateLimited',
  error: 'messageError',
};

/**
 * Progressive enhancement for `<form data-lead-form>`; the copy for each result comes from its
 * data-message-* attributes. Without JavaScript the form posts natively.
 */
export function enhanceLeadForms(selector: string): void {
  document.querySelectorAll<HTMLFormElement>(selector).forEach((form) => {
    if (form.dataset.enhanced) return;
    form.dataset.enhanced = 'true';
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      void handleSubmit(form);
    });
  });
}

async function handleSubmit(form: HTMLFormElement): Promise<void> {
  if (form.dataset.state === 'sending') return;

  clearInvalidFields(form);
  setState(form, 'sending');

  const result = await submitForm(form);
  if (result.ok) {
    form.reset();
    return setState(form, 'success');
  }

  setState(form, failureState(form, result.error));
}

function failureState(form: HTMLFormElement, error: AppError): ResultState {
  if (error.code === 'rate-limited') return 'rate-limited';

  const invalidFields = Object.keys(error.fieldErrors ?? {});
  if (error.code !== 'validation' || invalidFields.length === 0) return 'error';

  markInvalidFields(form, invalidFields);
  return 'invalid';
}

function setState(form: HTMLFormElement, state: FormState): void {
  form.dataset.state = state;

  const submitButton = form.querySelector<HTMLButtonElement>('[type="submit"]');
  submitButton?.toggleAttribute('aria-busy', state === 'sending');
  if (submitButton) submitButton.disabled = state === 'sending';

  const status = form.querySelector<HTMLElement>('[data-form-status]');
  if (!status) return;
  status.textContent = state === 'idle' || state === 'sending' ? '' : (form.dataset[MESSAGE_KEYS[state]] ?? '');
}

function markInvalidFields(form: HTMLFormElement, names: string[]): void {
  const status = form.querySelector<HTMLElement>('[data-form-status]');
  const groups = names.map((name) => controlsOf(form, name)).filter((group) => group.controls.length > 0);

  groups.forEach(({ controls, errorId }) => {
    const fieldError = document.getElementById(errorId);
    if (fieldError) fieldError.hidden = false;
    const description = fieldError ?? status;
    controls.forEach((control) => {
      control.setAttribute('aria-invalid', 'true');
      if (description?.id) control.setAttribute('aria-describedby', description.id);
    });
  });
  groups[0]?.controls[0]?.focus();
}

/** Radio groups come back as a RadioNodeList; their error message belongs to the surrounding fieldset. */
function controlsOf(form: HTMLFormElement, name: string): { controls: HTMLElement[]; errorId: string } {
  const item = form.elements.namedItem(name);
  if (item instanceof RadioNodeList) {
    const controls: HTMLElement[] = [...item].filter((node) => node instanceof HTMLElement);
    return { controls, errorId: `${controls[0]?.closest('fieldset')?.id ?? name}-error` };
  }
  return item instanceof HTMLElement
    ? { controls: [item], errorId: `${item.id}-error` }
    : { controls: [], errorId: '' };
}

function clearInvalidFields(form: HTMLFormElement): void {
  form.querySelectorAll('[aria-invalid]').forEach((control) => {
    control.removeAttribute('aria-invalid');
    control.removeAttribute('aria-describedby');
  });
  form.querySelectorAll<HTMLElement>('[data-field-error]').forEach((fieldError) => (fieldError.hidden = true));
}
