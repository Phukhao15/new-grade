declare namespace JSX {
  interface IntrinsicElements {
    'model-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      src?: string;
      alt?: string;
      ar?: boolean;
      'ar-modes'?: string;
      'camera-controls'?: boolean;
      'auto-rotate'?: boolean;
      'shadow-intensity'?: string;
      'touch-action'?: string;
      'camera-orbit'?: string;
      'min-camera-orbit'?: string;
      'max-camera-orbit'?: string;
      'interaction-prompt-threshold'?: string;
      'ios-src'?: string;
      style?: React.CSSProperties;
      // ใส่ any เผื่อ attribute อื่นๆ ที่อาจจะหลุด
      [key: string]: any;
    };
  }
}
