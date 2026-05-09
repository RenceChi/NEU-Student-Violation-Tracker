import { Stack } from "expo-router";
 
export default function ViolationLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        // "modal" presentation ensures each screen fully covers the previous one
        // and prevents the side-by-side rendering bug seen when pushing onto a
        // nested Stack inside a Tab navigator
        presentation: "modal",
        animation: "slide_from_right",
        // Freeze (unmount) screens when they lose focus so they don't
        // keep rendering underneath the newly pushed screen
        freezeOnBlur: true,
      }}
    />
  );
}