import { PageTemplateState, PageTemplateAction } from './types';

export const initialPageTemplateState: PageTemplateState = {
  isOpen: true,
};

export function pageTemplateReducer(
  state: PageTemplateState,
  action: PageTemplateAction,
): PageTemplateState {
  switch (action.type) {
    case 'OPEN': {
      return {
        ...state,
        isOpen: true,
      };
    }
    case 'CLOSE': {
      return {
        ...state,
        isOpen: false,
      };
    }
    default: {
      return { ...state, isOpen: false };
    }
  }
}
