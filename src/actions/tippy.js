import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';

export function tooltip(node, params) {
  let instance = tippy(node, params);

  return {
    update(newParams) {
      if (!newParams.content) {
        instance.hide(); // Oculta el tooltip si se hace hover
        instance.disable();
      } else {
        instance.enable();
        instance.setContent(newParams.content);
      }
    },
    destroy() {
      instance.destroy();
    }
  }
}