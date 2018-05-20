import * as ts from "typescript";
import * as path from "path";
import * as fs from "fs";

function compile() {
    const inputFilePath = path.resolve("./input.ts");
    const compilerOptions: ts.CompilerOptions = {
        target: ts.ScriptTarget.ES2015,
        module: ts.ModuleKind.CommonJS,
        outDir: path.resolve("./dist")
    };
    const program = ts.createProgram([inputFilePath], compilerOptions);
    const sourceFiles = program.getSourceFiles().filter(sf => sf.fileName === inputFilePath);
    const typeChecker = program.getTypeChecker();
    const result = ts.transform(sourceFiles, [AddVarStatement, AddTypeToVarStatement], compilerOptions);
    if (result.diagnostics && result.diagnostics.length) {
        console.error(result.diagnostics);
        throw new Error("tsc error");
    }
    const printer = ts.createPrinter();
    const printed = printer.printNode(ts.EmitHint.SourceFile, result.transformed[0], sourceFiles[0]);
    console.log("result:");
    console.log(printed);
}

/**
 * Add a variable declaration statement
 */
const AddVarStatement: ts.TransformerFactory<ts.SourceFile> = context => sourceFile => {
    const varDeclaration = ts.createVariableDeclaration("fooBarBaz", undefined, ts.createLiteral("foo-bar-baz"));
    const varDeclarationList = ts.createVariableDeclarationList([varDeclaration], ts.NodeFlags.Const);
    const varStatement = ts.createVariableStatement([], varDeclarationList);
    return ts.updateSourceFileNode(sourceFile, [...sourceFile.statements, varStatement]);
};

/**p
 * Add type "string" to all statements assuming all statements are variable declarations
 * @todo
 */
const AddTypeToVarStatement: ts.TransformerFactory<ts.SourceFile> = context => sourceFile => {
    for (const statement of sourceFile.statements) {
        // getText() will throw. commenting out the first transformer from list of transformers in line 15 will resolve it
        console.log("statement text:", statement.getText());
    }
    return sourceFile;
};

compile();
