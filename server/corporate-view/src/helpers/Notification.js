import { store } from "react-notifications-component";
import { toast } from "react-toastify";

export const AddNoti = (
  title,
  msg,
  {
    type = "info",
    position = "top-right",
    duration = 2000,
    hideProgressBar = false,
    closeOnClick = true,
    closeButton=true
  }
) => {
  return toast(msg, {
    type: type,
    position,
    autoClose: duration,
    className: "custom-toast",
    hideProgressBar,
    closeOnClick,
    closeButton
  });

  // store.addNotification({
  //   id: id,
  //   title: title,
  //   message: msg,
  //   type: type,
  //   insert: "top",
  //   container: container,
  //   animationIn: ["animated", "fadeIn"],
  //   animationOut: ["animated", "fadeOut"],
  //   dismiss: dismiss,
  // });
};

export const RemoveNoti = (id) => {
  toast.dismiss(id);
};
