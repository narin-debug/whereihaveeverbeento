export type Locale = "ko" | "en";

export const translations = {
  ko: {
    siteTitle: "Wanderlog — 세계여행 기록",
    siteDescription: "세계 곳곳을 다닌 여행의 기록",
    // Deliberately English in both locales -- part of the site's bilingual
    // branding style (see also the "Voyager" hero heading), not content.
    navMap: "Map",
    navAbout: "About",
    heroEyebrow: "A Travel Log",
    journeySoFar: "지금까지의 여정",
    addMemory: "+ 기록 남기기",
    mapLoading: "지도를 불러오는 중...",
    aboutText:
      "이 사이트는 세계여행의 순간들을 기록하기 위해 만들어졌습니다. 앞으로 다녀온 도시가 늘어날 때마다 지도 위에 새로운 기록이 쌓입니다.",
    scroll: "스크롤",
    formTitle: "새 기록 남기기",
    close: "닫기",
    destinationLabel: "여행지",
    photoLabel: "사진",
    photoPreviewAlt: "선택한 사진 미리보기",
    captionLabel: "캡션",
    captionPlaceholder: "이 순간을 짧게 남겨보세요",
    passwordLabel: "비밀번호",
    passwordPlaceholder: "소유자 비밀번호",
    saving: "저장 중...",
    saveMemory: "기록 저장",
    deleteAction: "삭제",
    deleteAriaLabel: "기록 삭제",
    deletePrompt: "삭제하려면 소유자 비밀번호를 입력하세요",
    errorInvalidPasscode: "비밀번호가 올바르지 않아요.",
    errorMissingFields: "필수 항목이 누락됐어요.",
    errorPhotoTooLarge: "사진이 너무 커요. 더 작은 사진으로 시도해주세요.",
    errorNotFound: "기록을 찾을 수 없어요.",
    errorSaveFailed: "기록을 저장하지 못했어요.",
    errorDeleteFailed: "기록을 삭제하지 못했어요.",
    errorPhotoProcessing: "사진을 처리하지 못했어요. 다른 사진으로 시도해주세요.",
    errorRateLimited: "너무 많이 시도했어요. 잠시 후 다시 시도해주세요.",
    timelineHeading: "타임라인",
    timelineEmpty: "아직 기록이 없어요.",
  },
  en: {
    siteTitle: "Wanderlog — A Travel Log",
    siteDescription: "A record of journeys around the world",
    navMap: "Map",
    navAbout: "About",
    heroEyebrow: "A Travel Log",
    journeySoFar: "The Journey So Far",
    addMemory: "+ Add a Memory",
    mapLoading: "Loading map...",
    aboutText:
      "This site was made to record moments from a life of travel. As more cities are visited, new memories will keep filling in the map.",
    scroll: "Scroll",
    formTitle: "Add a New Memory",
    close: "Close",
    destinationLabel: "Destination",
    photoLabel: "Photo",
    photoPreviewAlt: "Selected photo preview",
    captionLabel: "Caption",
    captionPlaceholder: "Write a short caption for this moment",
    passwordLabel: "Password",
    passwordPlaceholder: "Owner password",
    saving: "Saving...",
    saveMemory: "Save Memory",
    deleteAction: "Delete",
    deleteAriaLabel: "Delete memory",
    deletePrompt: "Enter the owner password to delete this",
    errorInvalidPasscode: "That password isn't right.",
    errorMissingFields: "Some required fields are missing.",
    errorPhotoTooLarge: "That photo is too large. Try a smaller one.",
    errorNotFound: "Couldn't find that memory.",
    errorSaveFailed: "Couldn't save the memory.",
    errorDeleteFailed: "Couldn't delete the memory.",
    errorPhotoProcessing: "Couldn't process that photo. Try a different one.",
    errorRateLimited: "Too many attempts. Please try again later.",
    timelineHeading: "Timeline",
    timelineEmpty: "No memories yet.",
  },
} as const satisfies Record<Locale, Record<string, string>>;

export type TranslationKey = keyof typeof translations.ko;

export function detectLocale(acceptLanguage: string | null): Locale {
  return acceptLanguage?.toLowerCase().startsWith("ko") ? "ko" : "en";
}

const ERROR_CODE_KEYS: Record<string, TranslationKey> = {
  invalid_passcode: "errorInvalidPasscode",
  missing_fields: "errorMissingFields",
  photo_too_large: "errorPhotoTooLarge",
  not_found: "errorNotFound",
  save_failed: "errorSaveFailed",
  delete_failed: "errorDeleteFailed",
  rate_limited: "errorRateLimited",
};

export function translateErrorCode(
  code: string,
  fallback: TranslationKey,
  t: (key: TranslationKey) => string,
): string {
  const key = ERROR_CODE_KEYS[code];
  return t(key ?? fallback);
}
