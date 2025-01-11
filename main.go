package main

import (
	"fmt"
	"net/http"
)

func main() {
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "Hello, Heroku! This is a basic Go backend app.")
	})

	port := "8080" // Heroku dynamically assigns ports, but we will use 8080 as the default
	fmt.Printf("Server starting on port %s...\n", port)
	http.ListenAndServe(":"+port, nil)
}
