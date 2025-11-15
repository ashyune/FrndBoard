function Track(){
    return(
        <div className="flex flex-col gap-3 w-full max-w-3xl">
            <div className="grid grid-cols-4 gap-2">
            <div className="h-16 bg-[#648DB3] rounded shadow-md hover:bg-[#79b2c7] hover:shadow-lg "></div>
            <div className="h-16 bg-[#648DB3] rounded shadow-md hover:bg-[#79b2c7] hover:shadow-lg"></div>
            <div className="h-16 bg-[#648DB3] rounded shadow-md hover:bg-[#79b2c7] hover:shadow-lg"></div>
            <div className="h-16 bg-[#648DB3] rounded shadow-md hover:bg-[#79b2c7] hover:shadow-lg"></div>
            </div>
        </div>
    );
}

export default Track;