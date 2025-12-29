import React, { useEffect } from "react";
import { View, Text } from "react-native";

export default function LoadingScreen({ navigation }: any) {
  useEffect(() => {
    (navigation.getParent?.() ?? navigation).navigate("RoleSelection");
  }, []);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>Loading...</Text>
    </View>
  );
}
