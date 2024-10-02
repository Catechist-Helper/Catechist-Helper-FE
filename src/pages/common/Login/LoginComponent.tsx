import React from "react";
import { Form, Input, theme } from "antd";
import { useFormik } from "formik";
import useAuth from "../../../hooks/useAuth";

const LoginComponent: React.FC = () => {
  const [form] = Form.useForm();
  const { login } = useAuth();
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      email: "",
      password: "",
    },
    onSubmit: async (values) => {
      await login(values.email, values.password);
    },
  });

  const handleForgetPassword = () => {};

  return (
    <>
      <div
        className="pt-[3rem] w-[40vw] rounded-md min-h-[5rem] min-w-[5rem] flex flex-row items-center justify-between max-w-full
 px-[2.5rem]"
        style={{ margin: "0 auto" }}
      >
        <div className=" w-[35vw] flex max-w-full flex-1 flex-col items-end justify-start gap-[5px_0px]">
          <h1
            className="text-[1.5rem] w-full text-center text-text_primary_light"
            style={{ fontWeight: "bolder" }}
          >
            Đăng Nhập
          </h1>
          <div className="w-full" style={{ margin: "0 auto" }}>
            <Form
              onFinish={formik.handleSubmit}
              form={form}
              size="large"
              autoComplete="off"
              className="w-full"
            >
              <div className="row align-items-start justify-content-between">
                <p className="text-lightslategray relative self-stretch pb-1 text-lg font-medium leading-[28px]">
                  <span className="text-text_primary_light">
                    Email
                    <span className="text-red-500">*</span>
                  </span>
                </p>
                <Form.Item
                  className="col-sm-12 col-md-7 mx-0 px-0"
                  name="email"
                  label=""
                  rules={[
                    {
                      required: true,
                      message: "Email không được để trống",
                    },
                    {
                      type: "email",
                      message: "Email không đúng định dạng",
                    },
                  ]}
                  hasFeedback
                >
                  <Input
                    id="input_email"
                    name="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    placeholder="Nhập email"
                  />
                </Form.Item>
              </div>

              <div className="row align-items-start justify-content-between">
                <p className="text-lightslategray relative self-stretch pb-1 text-lg font-medium leading-[28px]">
                  <span className="text-text_primary_light">
                    Mật khẩu
                    <span className="text-red-500">*</span>
                  </span>
                </p>
                <Form.Item
                  className="col-sm-12 col-md-7 mx-0 px-0"
                  name="password"
                  label=""
                  rules={[
                    {
                      required: true,
                      message: "Mật khẩu không được để trống",
                    },
                    {
                      min: 6,
                      message: "Mật khẩu phải có ít nhất 6 kí tự",
                    },
                    {
                      max: 50,
                      message: "Mật khẩu không được vượt quá 50 kí tự",
                    },
                    {
                      validator: (_, value) => {
                        let errors = [];
                        if (value && !/[A-Z]/.test(value)) {
                          errors.push(
                            "Mật khẩu phải chứa ít nhất 1 kí tự in hoa"
                          );
                        }
                        if (value && !/\d/.test(value)) {
                          errors.push("Mật khẩu phải chứa ít nhất 1 chữ số");
                        }
                        if (value && !/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
                          errors.push(
                            "Mật khẩu phải chứa ít nhất 1 kí tự đặc biệt"
                          );
                        }

                        if (errors.length > 0) {
                          return Promise.reject(errors);
                        }

                        return Promise.resolve();
                      },
                    },
                  ]}
                  hasFeedback
                >
                  <Input.Password
                    name="password"
                    type="password"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    placeholder="Nhập mật khẩu"
                  />
                </Form.Item>
              </div>

              <Form.Item className="text-center">
                <div className="mq450:flex-wrap flex flex-row justify-between">
                  <p
                    className="text-yellow-600 cursor-pointer text-end links_hover"
                    style={{ fontWeight: "bolder" }}
                    onClick={() => {
                      handleForgetPassword();
                    }}
                  >
                    Quên mật khẩu?
                  </p>
                </div>
                <button
                  type="submit"
                  style={{ fontWeight: "bolder" }}
                  className="hover:bg-yellow-600 bg-primary text-white mt-2 box-border flex w-full max-w-full flex-1 cursor-pointer flex-row items-start justify-center overflow-hidden whitespace-nowrap rounded-md bg-primary-colour px-5 py-[10px] [border:none]"
                >
                  <div className="font-baloo relative mt-0 flex w-full items-center justify-center text-center text-lg font-medium text-neutral-white">
                    Đăng Nhập
                  </div>
                </button>
              </Form.Item>
            </Form>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginComponent;
