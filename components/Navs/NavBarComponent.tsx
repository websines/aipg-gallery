import React from "react";
import Navbar from "./Navbar";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const NavBarComponent = async () => {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  return <Navbar user={user} />;
};

export default NavBarComponent;
