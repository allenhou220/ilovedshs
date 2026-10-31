// 投稿草稿：存在這台裝置的瀏覽器裡（localStorage），不會上傳到伺服器。
// 學生寫到一半關掉網頁或斷線，回來時可以接著寫；送出成功或按「清除草稿」就刪掉。

export const DRAFT_KEY = "wenhui-submit-draft-v1";
/** 草稿保留 14 天，過期自動丟棄（避免公用電腦留下太久） */
export const DRAFT_MAX_AGE = 14 * 24 * 60 * 60 * 1000;

export type DraftFields = {
  class: string;
  seatNumber: string;
  authorName: string;
  email: string;
  title: string;
  category: string;
  isAnonymous: boolean;
};

export type SubmitDraft = {
  fields: DraftFields;
  /** 編輯器的內容（HTML，送出用） */
  html: string;
  /** 編輯器的原始區塊資料（還原編輯器用） */
  blocks: unknown[];
  savedAt: number;
};

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

// 無痕模式、或瀏覽器禁止儲存時 localStorage 會丟出錯誤，一律當作「沒有儲存空間」
function getStorage(): StorageLike | null {
  try {
    if (typeof window === "undefined") return null;
    return window.localStorage;
  } catch {
    return null;
  }
}

const str = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : "");

/** 讀取草稿；格式不對、過期或沒有內容都回傳 null */
export function loadDraft(storage: StorageLike | null = getStorage(), now = Date.now()): SubmitDraft | null {
  if (!storage) return null;
  try {
    const raw = storage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || typeof data !== "object" || typeof data.savedAt !== "number") return null;
    if (now - data.savedAt > DRAFT_MAX_AGE) {
      storage.removeItem(DRAFT_KEY);
      return null;
    }
    const f = data.fields || {};
    const draft: SubmitDraft = {
      fields: {
        class: str(f.class, 40),
        seatNumber: str(f.seatNumber, 10),
        authorName: str(f.authorName, 60),
        email: str(f.email, 120),
        title: str(f.title, 200),
        category: str(f.category, 20),
        isAnonymous: f.isAnonymous === true,
      },
      html: str(data.html, 500_000),
      blocks: Array.isArray(data.blocks) ? data.blocks : [],
      savedAt: data.savedAt,
    };
    return isDraftEmpty(draft) ? null : draft;
  } catch {
    return null;
  }
}

/** 儲存草稿；沒有任何內容時改成刪除。回傳是否存成功 */
export function saveDraft(draft: SubmitDraft, storage: StorageLike | null = getStorage()): boolean {
  if (!storage) return false;
  try {
    if (isDraftEmpty(draft)) {
      storage.removeItem(DRAFT_KEY);
      return false;
    }
    storage.setItem(DRAFT_KEY, JSON.stringify(draft));
    return true;
  } catch {
    // 空間不足等狀況：存不了就算了，不影響投稿
    return false;
  }
}

export function clearDraft(storage: StorageLike | null = getStorage()) {
  try {
    storage?.removeItem(DRAFT_KEY);
  } catch {}
}

/** 只填了下拉選單的預設值、其他都空白，就視為沒有草稿 */
export function isDraftEmpty(d: SubmitDraft): boolean {
  const f = d.fields;
  const text = [f.class, f.seatNumber, f.authorName, f.email, f.title].some((v) => v.trim() !== "");
  const body = d.html.replace(/<[^>]*>/g, "").trim() !== "";
  return !text && !body;
}
