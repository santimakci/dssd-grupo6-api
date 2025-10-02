/* Example: Parse TypeScript class to Java class

    If ts class is String java should return java.lang.String
*/

export function parseTsClassToJavaClass(tsClass: string): string {
  switch (tsClass.toLowerCase()) {
    case 'string':
      return 'java.lang.String';
    case 'number':
      return 'java.lang.Double';
    case 'boolean':
      return 'java.lang.Boolean';
    case 'date':
      return 'java.util.Date';
    case 'array':
      return 'java.util.List';
    case 'object':
      return 'java.util.Map';
    case 'any':
      return 'java.lang.Object';
    default:
      return tsClass; // For custom classes, return as is
  }
}
