using Windows.Data.Pdf;
using Windows.Storage;
using Windows.Storage.Streams;

var root = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "..", "..", "..", ".."));
var pdfPath = Path.Combine(root, "visily-multiscreens.pdf");
var outputDir = Path.Combine(root, "visily-pages");

Directory.CreateDirectory(outputDir);

var file = await StorageFile.GetFileFromPathAsync(pdfPath);
var document = await PdfDocument.LoadFromFileAsync(file);

for (uint index = 0; index < document.PageCount; index++)
{
    using var page = document.GetPage(index);
    using var stream = new InMemoryRandomAccessStream();

    await page.RenderToStreamAsync(stream);
    stream.Seek(0);

    var buffer = new byte[stream.Size];
    using var reader = new DataReader(stream.GetInputStreamAt(0));
    await reader.LoadAsync((uint)stream.Size);
    reader.ReadBytes(buffer);

    var outputPath = Path.Combine(outputDir, $"page-{index + 1:00}.png");
    await File.WriteAllBytesAsync(outputPath, buffer);
}

Console.WriteLine($"Rendered {document.PageCount} page(s) to {outputDir}");
