import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MyFormComponent from "../MyFormComponent";

describe("MyFormComponent", () => {
  const setup = async (name, email, isAgreeWithTerms, gender) => {
    render(<MyFormComponent />);
    fireEvent.change(screen.getByPlaceholderText("Name"), {
      target: { value: name },
    });
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: email },
    });
    if (isAgreeWithTerms) {
      userEvent.click(screen.getByRole("checkbox"));
    }
    if (gender === "male") {
      userEvent.click(screen.getByDisplayValue("male"));
    }
  };

  const mockFetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ ok: true }),
    })
  );

  beforeEach(() => {
    window.fetch = mockFetch;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("Submit the form with all fields filled in correctly", async () => {
    await setup("Arsen Sharifov", "arsen.sharifov@gmail.com", true, "male");
    await waitFor(() => {
      expect(screen.getByPlaceholderText("Name").value).toBe("Arsen Sharifov");
    });
    userEvent.click(screen.getByText("Submit"));
    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1));
  });

  test("Submit the form with a very long valid name", async () => {
    setup(
      "A".repeat(150) + " Sharifov",
      "arsen.sharifov@gmail.com",
      true,
      "male"
    );
    userEvent.click(screen.getByText("Submit"));
    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1));
  });

  test("Submit the form with a complex email address", async () => {
    setup("Arsen Sharifov", "test.name+alias@example.co.uk", true, "male");
    userEvent.click(screen.getByText("Submit"));
    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1));
  });

  test("Change the gender from male to female and submit the form", async () => {
    setup("Arsen Sharifov", "test.name+alias@example.co.uk", true, "male");
    userEvent.click(screen.getByDisplayValue("female"));
    userEvent.click(screen.getByText("Submit"));
    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1));
  });

  test("Re-submit the form after an initial successful submission", async () => {
    setup("Arsen Sharifov", "arsen.sharifov@gmail.com", true, "male");
    userEvent.click(screen.getByText("Submit"));
    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1));

    fireEvent.change(screen.getByPlaceholderText("Name"), {
      target: { value: "New Name" },
    });
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "new.email@example.com" },
    });
    userEvent.click(screen.getByRole("checkbox"));
    userEvent.click(screen.getByRole("checkbox"));
    userEvent.click(screen.getByDisplayValue("male"));

    userEvent.click(screen.getByText("Submit"));
    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(2));
  });

  test("Submit the form with the 'Name' field left blank", async () => {
    setup("", "test.name+alias@example.co.uk", true, "male");
    await waitFor(() => expect(mockFetch).not.toHaveBeenCalled());
  });

  test("Submit the form with an invalid email address", async () => {
    setup("Arsen Sharifov", "sharifov.Arsen", true, "male");
    await waitFor(() => expect(mockFetch).not.toHaveBeenCalled());
  });

  test("Submit the form without checking the 'Agree to Terms' checkbox", async () => {
    setup("Arsen Sharifov", "sharifov.Arsen@example.com", false, "male");
    await waitFor(() => expect(mockFetch).not.toHaveBeenCalled());
  });

  test("Submit the form without selecting a gender", async () => {
    setup("Arsen Sharifov", "sharifov.Arsen@example.com", true, "");
    await waitFor(() => expect(mockFetch).not.toHaveBeenCalled());
  });

  test("Submit the form with a name that is less than 3 characters long", async () => {
    setup("Ar", "sharifov.Arsen@example.com", true, "male");
    await waitFor(() => expect(mockFetch).not.toHaveBeenCalled());
  });
});
