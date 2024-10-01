import Swal from "sweetalert2";

const sweetAlert = {
  alertSuccess: function (title: any, html: any, time: any, width: any) {
    const Toast = Swal.mixin({
      toast: true,
      position: "top-end",
      width: `${width.toString()}rem`,
      background: "#eef6ec",
      showConfirmButton: false,
      timer: time,
      timerProgressBar: true,
      showCloseButton: true,
      didOpen: (toast) => {
        toast.addEventListener("mouseenter", Swal.stopTimer);
        toast.addEventListener("mouseleave", Swal.resumeTimer);
      },
    });

    Toast.fire({
      icon: "success",
      title: `${title}`,
      html: `${html}`,
    })
  },
  alertFailed: function (title: any, html: any, time: any, width: any) {
    const Toast = Swal.mixin({
      toast: true,
      position: "top-end",
      width: `${width.toString()}rem`,
      background: "#fee3e2",
      showConfirmButton: false,
      timer: time,
      timerProgressBar: true,
      showCloseButton: true,
      didOpen: (toast) => {
        toast.addEventListener("mouseenter", Swal.stopTimer);
        toast.addEventListener("mouseleave", Swal.resumeTimer);
      },
    });

    Toast.fire({
      icon: "error",
      title: `${title}`,
      html: `${html}`,
    })
  },
  alertInfo: function (title: any, html: any, time: any, width: any) {
    const Toast = Swal.mixin({
      toast: true,
      position: "top-end",
      width: `${width.toString()}rem`,
      background: "#d0efff",
      showConfirmButton: false,
      timer: time,
      timerProgressBar: true,
      showCloseButton: true,
      didOpen: (toast) => {
        toast.addEventListener("mouseenter", Swal.stopTimer);
        toast.addEventListener("mouseleave", Swal.resumeTimer);
      },
    });

    Toast.fire({
      icon: "info",
      title: `${title}`,
      html: `${html}`,
    })
  },
  alertWarning: function (title: any, html: any, time: any, width: any) {
    const Toast = Swal.mixin({
      toast: true,
      position: "top-end",
      width: `${width.toString()}rem`,
      background: "#ffffcc",
      showConfirmButton: false,
      timer: time,
      timerProgressBar: true,
      showCloseButton: true,
      didOpen: (toast) => {
        toast.addEventListener("mouseenter", Swal.stopTimer);
        toast.addEventListener("mouseleave", Swal.resumeTimer);
      },
    });

    Toast.fire({
      icon: "warning",
      title: `${title}`,
      html: `${html}`,
    })
  },
};

export default sweetAlert;
