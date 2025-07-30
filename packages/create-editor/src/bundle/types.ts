export interface ManifestComponent {
  /** the name of the component */
  name: string;
  /** the path to the file */
  src: string;
}

export interface Manifest {
  /** List of components to expose via Module Federation */
  components: ManifestComponent[];
}

export interface BuildOptions {
  debug: boolean;
  projectPath: string;
}
