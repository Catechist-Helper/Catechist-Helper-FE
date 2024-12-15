import Swal from "sweetalert2";

const sweetAlert = {
  alertSuccess: function (title: any, html?: any, time?: any, width?: any) {
    const Toast = Swal.mixin({
      toast: true,
      position: "top-end",
      width: width ? `${width.toString()}rem` : "26rem",
      background: "#eef6ec",
      showConfirmButton: false,
      timer: time ? time :  4000,
      timerProgressBar: true,
      showCloseButton: true,
      didOpen: (toast) => {
        const swalElement = document.querySelector(
        ".swal2-container"
        ) as HTMLElement;
        if (swalElement) {
          swalElement.style.zIndex = "10000";
        }
        toast.addEventListener("mouseenter", Swal.stopTimer);
        toast.addEventListener("mouseleave", Swal.resumeTimer);
      },
    });

    Toast.fire({
      icon: "success",
      title: `${title}`,
      html: html?`${html}`:"",
    })
  },
  alertFailed: function (title: any, html?: any, time?: any, width?: any) {
    const Toast = Swal.mixin({
      toast: true,
      position: "top-end",
      width: width ? `${width.toString()}rem` : "26rem",
      background: "#fee3e2",
      showConfirmButton: false,
      timer: time ? time :  4000,
      timerProgressBar: true,
      showCloseButton: true,
      didOpen: (toast) => {
        const swalElement = document.querySelector(
        ".swal2-container"
        ) as HTMLElement;
        if (swalElement) {
          swalElement.style.zIndex = "10000";
        }
        toast.addEventListener("mouseenter", Swal.stopTimer);
        toast.addEventListener("mouseleave", Swal.resumeTimer);
      },
    });

    Toast.fire({
      icon: "error",
      title: `${title}`,
      html: html?`${html}`:"",
    })
  },
  alertInfo: function (title: any, html?: any, time?: any, width?: any) {
    const Toast = Swal.mixin({
      toast: true,
      position: "top-end",
            width: width ? `${width.toString()}rem` : "26rem",
      background: "#d0efff",
      showConfirmButton: false,
      timer: time ? time :  4000,
      timerProgressBar: true,
      showCloseButton: true,
      didOpen: (toast) => {
        const swalElement = document.querySelector(
        ".swal2-container"
        ) as HTMLElement;
        if (swalElement) {
          swalElement.style.zIndex = "10000";
        }
        toast.addEventListener("mouseenter", Swal.stopTimer);
        toast.addEventListener("mouseleave", Swal.resumeTimer);
      },
    });

    Toast.fire({
      icon: "info",
      title: `${title}`,
      html: html?`${html}`:"",
    })
  },
  alertWarning: function (title: any, html?: any, time?: any, width?: any) {
    const Toast = Swal.mixin({
      toast: true,
      position: "top-end",
      width: width ? `${width.toString()}rem` : "26rem",
      background: "#ffffcc",
      showConfirmButton: false,
      timer: time ? time :  4000,
      timerProgressBar: true,
      showCloseButton: true,
      didOpen: (toast) => {
        const swalElement = document.querySelector(
        ".swal2-container"
        ) as HTMLElement;
        if (swalElement) {
          swalElement.style.zIndex = "10000";
        }
        toast.addEventListener("mouseenter", Swal.stopTimer);
        toast.addEventListener("mouseleave", Swal.resumeTimer);
      },
    });

    Toast.fire({
      icon: "warning",
      title: `${title}`,
      html: html?`${html}`:"",
    })
  },
  confirm: async function (
    title: string,
    text: string,
    confirmButtonText: string = "Xác nhận",
    cancelButtonText: string = "Hủy bỏ",
    icon: "warning" | "info" | "question" | "success" | "error" = "warning"
  ): Promise<boolean> {
    const result = await Swal.fire({
      title: title,
      html: text,
      loaderHtml:text,
      icon: icon,
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: confirmButtonText,
      cancelButtonText: cancelButtonText,
      didOpen: (toast) => {
        const swalElement = document.querySelector(
        ".swal2-container"
        ) as HTMLElement;
        if (swalElement) {
          swalElement.style.zIndex = "10000";
        }
        toast.addEventListener("mouseenter", Swal.stopTimer);
        toast.addEventListener("mouseleave", Swal.resumeTimer);
      },
    });

    return result.isConfirmed; // Trả về true nếu người dùng nhấn "Xác nhận"
  },
};

export default sweetAlert;
