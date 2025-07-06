#!/usr/bin/env node
import { Command } from "commander";
import { templates } from "./templates";

const program = new Command();
program
  .name("codegen")
  .description("List available code generation templates")
  .action(() => {
    for (const t of templates) {
      console.log(`${t.name} - ${t.description}`);
    }
  });

program.parse(process.argv);
