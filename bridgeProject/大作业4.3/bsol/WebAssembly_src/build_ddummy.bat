emcc -static -O3 -sINITIAL_MEMORY=67108864 -sALLOW_MEMORY_GROWTH=1 -sEXPORTED_RUNTIME_METHODS=ccall,cwrap DDummy.cpp dds.cpp timer.cpp -o dds.js

