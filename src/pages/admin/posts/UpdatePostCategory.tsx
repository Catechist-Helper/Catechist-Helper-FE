import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import { useParams, useNavigate } from "react-router-dom";
import postCategoryApi from "../../../api/PostCategory";
import AdminTemplate from "../../../components/Templates/AdminTemplate/AdminTemplate";

const UpdatePostCategory: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formik = useFormik({
    initialValues: {
    },

    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        const response = await postCategoryApi.update(
          id!,
          values.name,
          values.description
        );
        console.log("Update successful: ", response);
        navigate("/admin");
      } catch (error) {
        console.error("Update failed: ", error);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        if (!id) {
          throw new Error("ID is undefined");
        }

        const response = await postCategoryApi.getById(id);
        const category = response.data;

        formik.setValues({
          name: category.data.name,
          description: category.data.description,
        });

        console.log("Updated Formik values:", formik.values);
      } catch (error) {
        console.error("Failed to fetch category data:", error);
      }
    };

    fetchCategory();
  }, [id]);

  return (
    <AdminTemplate>
      <div>
        <h2>Update Post Category</h2>
        <form onSubmit={formik.handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name:</label>
            <input
              type="text"
              className="form-control"
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Description:</label>
            <input
              type="text"
              className="form-control"
              name="description"
              value={formik.values.description}
              onChange={formik.handleChange}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Updating..." : "Update Post Category"}
          </button>
        </form>
      </div>
    </AdminTemplate>
  );
};

export default UpdatePostCategory;
