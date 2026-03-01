export interface ValidationErrors {
  title?: string;
  description?: string;
  deadline?: string;
  budget?: string;
}

export function validateForm(form: {
  title: string;
  description: string;
  deadline?: string;
  budget?: string;
}): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!form.title?.trim()) {
    errors.title = "프로젝트명을 입력해주세요.";
  } else if (form.title.length > 100) {
    errors.title = "프로젝트명은 100자 이내로 입력해주세요.";
  }

  if (!form.description?.trim()) {
    errors.description = "요구사항을 입력해주세요.";
  } else if (form.description.length > 5000) {
    errors.description = "요구사항은 5,000자 이내로 입력해주세요.";
  }

  if (form.deadline && !/^\d{4}-\d{2}-\d{2}$/.test(form.deadline)) {
    errors.deadline = "날짜 형식이 올바르지 않습니다. (예: 2026-04-30)";
  }

  if (form.budget && form.budget.length > 50) {
    errors.budget = "예산은 50자 이내로 입력해주세요.";
  }

  return errors;
}

export function hasErrors(errors: ValidationErrors): boolean {
  return Object.values(errors).some(Boolean);
}
