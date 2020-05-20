import { store } from "react-notifications-component";

export const AddNoti = (
  title,
  msg,
  type = "info",
  duration = 3000,
  container = "top-right"
) => {
  store.addNotification({
    title: title,
    message: msg,
    type: type,
    insert: "top",
    container: container,
    animationIn: ["animated", "fadeIn"],
    animationOut: ["animated", "fadeOut"],
    dismiss: {
      duration: duration,
      onScreen: true,
    },
  });
};
