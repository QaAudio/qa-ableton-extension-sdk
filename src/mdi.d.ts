declare module "vue-material-design-icons/*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{
    title?: string;
    fillColor?: string;
    size?: number;
  }>;
  export default component;
}
